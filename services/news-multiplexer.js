/** echelonews - News multiplexer
 * @license
 * Copyright (c) 2020 Nicola Colao, Paolo Lucchesi, Dejan Nuzzi
 * All rights reserved
 */
"use strict";
const EventEmitter = require("events");
const amqp = require("amqplib");
const pino = require("pino");
const { Article } = require("../models/article");
const { translateArticle } = require("../lib/translate");

const log = pino({ level: process.env.LOG_LEVEL || "info" });

const DEFAULT_RPC_QUEUE = "echelonews-multiplexer-rpc";

class NewsMultiplexer {
  /** Construct a news multiplexer
   * @param {object} opt - Constructor parameters
   * @param {string} opt.broker - URL for the AMQP message broker
   * @param {string} opt.queueName - Name of the (pseudo-)RPC message queue
   * @param {string} opt.prefetch - AMQP channel prefetch
   */
  constructor({ broker, queueName, prefetch } = {}) {
    this.broker = broker;
    this.queueName = queueName;
    this.prefetch = prefetch || 8;
  }

  /** Setup a multiplexer instance */
  async setup() {
    try {
      // Setup connection and channel
      log.info("Setting up multiplexer server channel");
      this.conn = await amqp.connect(this.broker);
      this.channel = await this.conn.createChannel();
      this.channel.assertQueue(this.queueName, {
        durable: true,
      });
      this.channel.prefetch(this.prefetch);

      // Setup multiplexer task policy
      this.channel.consume(
        this.queueName,
        async function (msg) {
          try {
            // Extract payload and metadata from received message
            const payload = JSON.parse(msg.content.toString());
            const correlationId = msg.properties.correlationId;
            log.info(`Processing RPC call ${correlationId}`);

            // Multiplex news
            const muxed = await Article.multiplex(payload);

            // Translate news
            for (const art of muxed) {
              await translateArticle(art, payload.lang).catch((err) => {
                log.warn("Error while translating articles\n%o", err);
              });
            }

            // Send RPC response
            this.channel.sendToQueue(
              msg.properties.replyTo,
              Buffer.from(JSON.stringify(muxed)),
              {
                correlationId: msg.properties.correlationId,
              }
            );
            this.channel.ack(msg);

            log.info(`Completed RPC call ${correlationId}`);
          } catch (err) {
            // Error - NACK the message
            this.channel.ack(msg);
            throw err;
          }
        }.bind(this)
      );
    } catch (err) {
      throw err;
    }
  }

  /** Gracefully cleanup a multiplexer server instance */
  async cleanup() {
    try {
      await Article.db.cleanup();
      if (!this.conn) return;
      await this.conn.close();
      this.conn = null;
      this.channel = null;
    } catch (err) {
      throw err;
    }
  }
}

/** News Multiplexer client */
class NewsMultiplexerClient extends EventEmitter {
  /** Create a multiplexer client
   * @param {object} opt - Constructor parameters
   * @param {string} opt.broker - URL for the AMQP message broker
   * @param {string} opt.queueName - Name of the (pseudo-)RPC message queue
   */
  constructor({ broker, queueName } = {}) {
    super();
    this.broker = broker;
    this.queueName = queueName;
  }

  /** Setup the news multiplexer client */
  async setup() {
    if (!this.broker) throw new Error("Undefined AMQP broker");
    if (!this.queueName) throw new Error("Undefined RPC queue name");

    try {
      // Setup connection and channel
      log.info("Setting up multiplexer client channel");
      this.conn = await amqp.connect(this.broker);
      this.channel = await this.conn.createChannel();
      this.channel.assertQueue(this.queueName, {
        durable: true,
      });

      // Setup response queue
      this.nextCorrelationId = 1;
      this.responseQueue = await this.channel.assertQueue("", {
        exclusive: true,
      });
      this.channel.consume(
        this.responseQueue.queue,
        function (msg) {
          log.info(
            `Received response with correlation ID ${msg.properties.correlationId}`
          );
          this.emit(
            `rpc${msg.properties.correlationId}`,
            JSON.parse(msg.content.toString())
          );
        }.bind(this)
      );
    } catch (err) {
      log.error(err);
      throw err;
    }
  }

  /** Perform a multiplexer RPC call
   * @param {object} opt - RPC parameters
   * @param {number} opt.uid - Related user id
   * @param {string} opt.topic - Topic to multiplex
   * @param {Array<string>} opt.countries - Countries to multiplex
   * @param {string} opt.lang - Langauge inwhich to translate articles
   * @param {boolean} opt.oauth - Multiplex for OAuth users?
   * @returns {Array<Article>} A collection of articles, sorted by score
   */
  async multiplex({ uid, topic, countries, lang, oauth } = {}) {
    try {
      const articles = await new Promise(
        function (resolve) {
          // Iterate over the correlation ID
          const correlationId = (this.nextCorrelationId++).toString();
          log.info(`Performing multiplex RPC call ${correlationId}`);

          // Start listening for the RPC response
          this.on(`rpc${correlationId}`, resolve);

          // Effectively perform the the RPC
          this.channel.sendToQueue(
            this.queueName,
            Buffer.from(
              JSON.stringify({
                uid,
                topic,
                countries,
                lang,
                oauth,
              })
            ),
            {
              correlationId,
              replyTo: this.responseQueue.queue,
            }
          );
        }.bind(this)
      );
      return articles;
    } catch (err) {
      throw err;
    }
  }

  /** Gracefully cleanup a multiplexer client instance */
  async cleanup() {
    if (!this.conn) return;
    try {
      await this.conn.close();
      this.conn = null;
      this.channel = null;
      this.responseQueue = null;
    } catch (err) {
      throw err;
    }
  }
}

// If this is the main module, launch the multiplexer
if (require.main === module) {
  log.info("Starting News Multiplexer in standalone mode");
  // Assert AMQP broker definition and existence
  const broker = process.env.AMQP_BROKER;
  if (!broker) {
    log.fatal(
      "AMQP broker is not defined. You must properly define the AMQP_BROKER environment variable"
    );
    process.exit(1);
  }

  // Setup database for Article model
  Article.db.setup(process.env.POSTGRES_URI);

  // Setup news multiplexer server
  const muxer = new NewsMultiplexer({
    broker,
    prefetch: process.env.AMQP_PREFETCH,
    queueName: process.env.AMQP_QUEUE_NAME || DEFAULT_RPC_QUEUE,
  });

  // Setup graceful close on SIGINT
  process.once("SIGINT", () => {
    muxer.conn
      .close()
      .then(() => {
        log.debug("Multiplexer server gracefully closed");
        process.exit(0);
      })
      .catch(log.error);
  });

  // Setup multiplexer
  muxer.setup().catch((err) => {
    // Don't need to await
    log.fatal(err);
    process.exit(1);
  });
}

module.exports = { NewsMultiplexer, NewsMultiplexerClient, DEFAULT_RPC_QUEUE };
