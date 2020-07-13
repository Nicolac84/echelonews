/** echelonews - News organizer module
 * @license
 * Copyright (c) 2020 Nicola Colao, Paolo Lucchesi, Dejan Nuzzi
 * All rights reserved
 */
"use strict";
const { Newspaper } = require("../models/newspaper");
const { Article } = require("../models/article");
const fetch = require("node-fetch");
const Parser = require("rss-parser");
const pino = require("pino");

const parser = new Parser();
const log = pino({ level: process.env.LOG_LEVEL || "info" });

/** RSS feed fetcher */
class RssFetcher {
  /** Create a new RSS Fetcher
   * @param {number} opt.interval - The fetching interval
   * @param {string} opt.organizerUrl - URL of the news organizer
   */
  constructor({ interval = 30000, organizerUrl = null } = {}) {
    this.organizerUrl = organizerUrl;
    this.interval = interval;
    this.initialized = false;
    this.npapers = null;
  }

  /** Initialize the database and fetch all the RSS sources
   * @returns {Promise<RssFetcher>} this RssFetcher instance as a promise
   */
  setup() {
    Newspaper.db.setup(process.env.POSTGRES_URI);
    return Newspaper.fetchMany({ sourceType: "rss" }).then(
      function (npapers) {
        this.npapers = npapers.map((np) => {
          np.info.lastFetched = new Date(np.info.lastFetched || 0);
          return np;
        });
        log.info(`Setup completed with ${npapers.length} newspaper(s)`);
        return this;
      }.bind(this)
    );
  }

  /** Cleanup the news fetcher, closing the pool for ALL the fetcher instances
   * @returns {undefined}
   */
  static async cleanup() {
    await Newspaper.db.cleanup();
  }

  /** Execute the fetcher task, i.e. fetch an RSS feed, process it and store
   * the related articles (if any)
   * @returns {undefined}
   */
  async task() {
    log.info("Fetcher task started");
    for (const np of this.npapers) {
      try {
        const news = await RssFetcher.process(
          np,
          await RssFetcher.download(np)
        );
        if (news && (await this.store(news)) > 0) {
          log.info(`Updating newspaper ${np.id} lastFetched field`);
          np.info.lastFetched = new Date();
          await np.update("info");
        }
      } catch (err) {
        log.error(err);
      }
    }
    log.info(`Task completed - Sleeping for ${this.interval} seconds`);
    await sleep(this.interval).catch(log.error); // TODO: Time difference
  }

  /** Execute the fetcher task in loop */
  async run() {
    log.info("Fetcher activity started");
    while (1) {
      try {
        await this.task();
      } catch (err) {
        log.error(err);
      }
    }
  }

  /** Download an RSS feed - This function is separated to ease testing
   * @param {Newspaper} source - Source newspaper
   * @returns {String|null} The RSS feed, or null if it has not been modified
   *   since last fetch timestamp
   */
  static async download(source) {
    try {
      if (!source || !source.info || !source.info.origin) {
        throw new TypeError("Invalid source newspaper");
      }
      log.info(`Downloading RSS for newspaper ${source.id}`);

      const lastFetched = source.info.lastFetched || new Date(0);
      log.info(`lastFetched is '${lastFetched}' for newspaper ${source.id}`);
      const res = await fetch(source.info.origin, {
        method: "get",
        headers: { "If-Modified-Since": lastFetched.toUTCString() },
      });

      if (res.status === 304) {
        log.info(`RSS for newspaper ${source.id} was not recent`);
        return null;
      } else if (res.ok) {
        log.info(`Incoming RSS for newspaper ${source.id}`);
        return res.text();
      } else throw new Error(`Fetching URL returned status code ${res.status}`);
    } catch (err) {
      throw err;
    }
  }

  /** Process a raw RSS feed
   * @param {Newspaper} source - Source newspaper
   * @param {String|null} rss - The raw RSS feed, which is null if not recent
   * @returns {Array<Article>|null} An array of recent articles to insert, or
   *  null if the RSS has not been modified since last fetch timestamp
   */
  static async process(source, rss) {
    function classify(article, npaper) {
      const topics = article.categories
        ? article.categories.map((e) => (e._ ? e._.split("/") : [])).flat()
        : [];
      if (npaper.info.topic) topics.push(npaper.info.topic);
      return topics;
    }

    try {
      log.debug("Processing source newspaper %o", source);
      if (!rss) return null;

      log.info(`Processing RSS for newspaper ${source.id}`);
      const news = await parser.parseString(rss);
      if (!news.items) return null;

      const ret = news.items
        .filter((e) => new Date(e.isoDate) > source.info.lastFetched)
        .map((item) => ({
          source: source.id,
          title: item.title,
          preview: item.content,
          origin: item.link,
          topics: classify(item, source),
          created: new Date(item.isoDate),
        }));
      log.info(`Processed ${ret.length} articles`);
      return ret;
    } catch (err) {
      throw err;
    }
  }

  /** Store a sequence of articles
   * @param {Iterable<Article>} articles - An iterable collection of articles
   * @returns {number} The number of successfully stored articles
   */
  async store(articles) {
    if (!articles) return 0;
    log.info(`Storing ${articles.length} articles`);
    let n = 0;
    for (const art of articles) {
      try {
        const res = await fetch(`${this.organizerUrl}/store`, {
          method: "post",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(art),
        });
        log.info(`Stored new article\n${art.title}`);
        if (res.ok) ++n;
      } catch (err) {
        log.error(err);
      }
    }
    return n;
  }
}

// Sleep (with promises)
function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// If this is the main module, launch the news fetcher
if (require.main === module) {
  (async function () {
    try {
      const fetcher = new RssFetcher({
        interval: process.env.INTERVAL,
        organizerUrl: process.env.ORGANIZER_URL,
      });
      log.debug(`Organizer URL: ${fetcher.organizerUrl}`);
      log.debug(`Interval: ${fetcher.interval}`);
      await fetcher.setup();
      await fetcher.run();
    } catch (err) {
      throw err;
    }
  })();
}

module.exports = { RssFetcher };
