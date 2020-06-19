/** echelonews - News organizer module
 * @license
 * Copyright (c) 2020 Nicola Colao, Paolo Lucchesi, Dejan Nuzzi
 * All rights reserved
 */
'use strict'
const { Newspaper } = require('../models/newspaper')
const { Article } = require('../models/article')
const fetch = require('node-fetch')
const Parser = require('rss-parser')
const parser = new Parser()

/** RSS feed fetcher */
class RssFetcher {
  /** Create a new RSS Fetcher
   * @param {number} opt.interval - The fetching interval
   * @param {string} opt.organizerUrl - URL of the news organizer
   */
  constructor({ interval=30000, organizerUrl=null } = {}) {
    this.organizerUrl = organizerUrl
    this.interval = interval
    this.initialized = false
    this.npapers = null
  }

  /** Initialize the database and fetch all the RSS sources
   * @returns {Promise<RssFetcher>} this RssFetcher instance as a promise
   */
  setup() {
    if (!Newspaper.db) Newspaper.db.setup(process.env.POSTGRES_URI)
    return Newspaper.fetchMany({ sourceType: 'rss' })
      .then(function(npapers) {
        this.npapers = npapers
        return this
      }.bind(this))
  }

  /** Execute the fetcher task, i.e. fetch an RSS feed, process it and store
   * the related articles (if any)
   */
  async task() {
    for (const np of this.npapers) {
      try {
        const news = RssFetcher.process(await RssFetcher.download(np))
        if (news) await this.store(news)
      } catch (err) {
        console.error(err)
      }
    }
    await sleep(this.interval).catch(console.error)// TODO: Time difference
  }

  /** Execute the fetcher task in loop */
  async run() {
    while (1) { try { await this.task() } catch (err) { console.error(err) } }
  }

  /** Download an RSS feed - This function is separated to ease testing
   * @param {Newspaper} source - Source newspaper
   * @returns {String|null} The RSS feed, or null if it has not been modified
   *   since last fetch timestamp
   */
  static async download(source) {
    try {
      if (!source || !source.info || !source.info.origin)
        throw new TypeError('Invalid source newspaper')

      const res = await fetch(source.info.origin, {
        method: 'get',
        headers: { 'If-Modified-Since': source.info.lastFetched.toUTCString() }
      })

      if (res.status === 304) return null
      else if (res.ok) return res.text()
      else throw new Error(`Fetching URL returned status code ${res.status}`)
    } catch (err) {
      throw err
    }
  }

  /** Process a raw RSS feed
   * @param {Newspaper} source - Source newspaper
   * @param {String|null} rss - The raw RSS feed, which is null if not recent
   * @returns {Array<Article>|null} An array of recent articles to insert, or
   *  null if the RSS has not been modified since last fetch timestamp
   */
  static async process(source, rss) {
    try {
      if (!rss) return null
      const news = await parser.parseString(rss)
      if (!news.items) return null
      let ret = news.items
        .filter(e => new Date(e.isoDate) > source.info.lastFetched)
        .map(item => ({
          source: source.id,
          title: item.title,
          preview: item.content,
          origin: item.link,
          topics: item.categories ? item.categories.map(e => e._ ? e._.split('/') : []).flat() : [],
          created: new Date(item.isoDate)
        }))
      return ret
    } catch (err) {
      throw err
    }
  }

  /** Store a sequence of articles
   * @param {Iterable<Article>} articles - An iterable collection of articles
   * @returns {number} The number of successfully stored articles
   */
  async store(articles) {
    if (!articles) return 0
    let n = 0;
    for (const art of articles) {
      try {
        const res = await fetch(`${this.organizerUrl}/store`, {
          method: 'post',
          headers: { 'Content-Type': 'application/json' },
          body: art
        })
        if (res.ok) ++n
      } catch (err) {
        console.error(err)
      }
    }
    return n
  }
}

// Sleep (with promises)
function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

// If this is the main module, launch the news fetcher
if (require.main === module) {
  (async function() {
    try {
      const fetcher = new RssFetcher({
        interval: process.env.INTERVAL,
        organizerUrl: process.env.ORGANIZER_URL
      })
      await fetcher.setup()
      await fetcher.run()
    } catch (err) {
      throw err
    }
  })();
}

module.exports = { RssFetcher }
