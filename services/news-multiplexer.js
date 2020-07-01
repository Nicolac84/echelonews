/** echelonews - News multiplexer
 * @license
 * Copyright (c) 2020 Nicola Colao, Paolo Lucchesi, Dejan Nuzzi
 * All rights reserved
 */
'use strict'
const amqp = require('amqplib')
const pino = require('pino')
const { Article } = require('../models/article')

const log = pino({ level: process.env.LOG_LEVEL || 'info' })

class NewsMultiplexer {
  /** Construct a news multiplexer
   * @param {object} opt - Constructor parameters
   * @param {string} opt.broker - URL for the AMQP message broker
   * @param {string} opt.queueName - Name of the (pseudo-)RPC message queue
   * @param {string} opt.prefetch - AMQP channel prefetch
   */
  constructor({ broker, queueName, prefetch } = {}) {
    this.broker = broker
    this.queueName = queueName
    this.prefetch = prefetch || 8
  }

  /** Setup a multiplexer instance */
  async setup() {
    try {
      // Setup connection and channel
      log.info('Setting up multiplexer server channel')
      this.conn = await amqp.connect(this.broker)
      this.channel = await this.conn.createChannel()
      this.channel.assertQueue(this.queue, {
        durable: true
      })
      this.channel.prefetch(this.prefetch)

      // Setup multiplexer task policy
      this.channel.consume(async msg => {
        try {
          log.info(`Processing RPC call\n%o`, msg.content)
          // Multiplex news
          const muxed = await this.constructor.multiplex({
            uid: msg.content.uid,
            topic: msg.content.topic,
            countries: msg.content.countries
          })
          // Send RPC response
          this.channel.sendToQueue(msg.properties.replyTo, Buffer.from(muxed, {
            correlationId: msg.properties.correlationId
          }))
          channel.ack(msg)
        } catch (err) {
          // Error - NACK the message
          log.error(err)
          channel.nack(msg)
          throw err
        }
      })
    } catch (err) {
      throw err
    }
  }

  /** Fetch news for a user
   * @param {object} opt - Constructor parameters
   * @param {number} opt.uid - Reference user ID
   * @param {string} opt.topic - Topic to multiplex
   * @param {Array<string>} opt.countries - Countries to multiplex
   * @returns {Array<Article>} An ordered collection of articles
   */
  static async multiplex({ uid, topic, countries } = {}) {
    log.info(`Multiplexing for user ${uid} - ${topic} ${countries.join(',')}`)
    let allNews = []
    for (const c of countries) {
      const news = await Article.multiplex({ uid, topic, country: c })
      allNews = allNews.concat(news)
    }
    return allNews.sort((a,b) => {
      if (a.score > b.score) return 1
      else if (a.score < b.score) return -1
      else return 0
    })
  }
}

/** News Multiplexer client */
class NewsMultiplexerClient {
  /** Create a multiplexer client
   * @param {object} opt - Constructor parameters
   * @param {string} opt.broker - URL for the AMQP message broker
   * @param {string} opt.queueName - Name of the (pseudo-)RPC message queue
   */
  constructor({ broker, queueName } = {}) {
    this.broker = broker
    this.queueName = queueName
  }

  /** Setup the news multiplexer client */
  async setup() {
    try {
      // Setup connection and channel
      log.info('Setting up multiplexer client channel')
      this.conn = await amqp.connect(this.broker)
      this.channel = await this.conn.createChannel()
      this.channel.assertQueue(this.queue, {
        durable: true
      })

      // Setup response queue
      this.nextCorrelationId = 1
      this.responseQueue = await this.channel.assertQueue('', {
        exclusive: true
      })
      this.channel.consume(this.responseQueue.queue, msg => {
        log.info(`Received response with correlation ID ${msg.properties.correlationId}`)
        // TODO
      })
    } catch (err) {
      log.error(err)
      throw err
    }
  }

  /** Perform a multiplexer RPC call
   * @param {object} opt - RPC parameters
   * @param {number} opt.uid - Related user id
   * @param {string} opt.topic - Topic to multiplex
   * @param {Array<string>} opt.countries - Countries to multiplex
   * @returns {Array<Article>} A collection of articles, sorted by score
   */
  async multiplex({ uid, topic, countries } = {}) {
    // TODO
  }
}

// If this is the main module, launch the multiplexer
if (require.main === module) {
  log.info('Starting News Multiplexer in standalone mode')
  // Assert AMQP broker definition and existence
  const broker = process.env.AMQP_BROKER
  if (!broker) {
    log.fatal('AMQP broker is not defined. You should properly define the AMQP_BROKER env variable')
    process.exit(1)
  }

  Article.db.setup(process.env.POSTGRES_URI)

  const muxer = new NewsMultiplexer({
    broker,
    prefetch: process.env.AMQP_PREFETCH,
    queueName: process.env.AMQP_QUEUE_NAME || 'echelonews-multiplexer-calls'
  })

  muxer.setup().catch(err => {  // Don't need to await
    log.fatal(err)
    process.exit(1)
  })
}

module.exports = { NewsMultiplexer, NewsMultiplexerClient }
