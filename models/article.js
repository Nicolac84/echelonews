/** echelonews - Article model
 * @requires validable
 * @requires perseest
 * @license
 * Copyright (c) 2020 Nicola Colao, Paolo Lucchesi, Dejan Nuzzi
 * All rights reserved
 * This software is licensed under the MIT license found in the file LICENSE
 * in the root directory of this repository
 */
"use strict";
const Validable = require("validable");
const Perseest = require("perseest");
const modHelpers = require("../lib/models-helpers");
Object.assign(Validable.validate.validators, require("../lib/validators"));

/** Article, with no persistence support */
class VolatileArticle extends Validable.Class {
  /** Instantiate a new Article
   * @param {object} opt - Constructor parameters
   * @param {integer} opt.id - Article univocal ID
   * @param {integer} opt.source - Article newspaper
   * @param {string} opt.title - Article title
   * @param {string} opt.preview - Article short description
   * @param {string} opt.origin - Reference URL to the full article
   * @param {Array<string>} opt.topics - Treated topics
   * @param {Date} opt.created - Article creation date and time
   */
  constructor(opt = {}) {
    super();
    this.id = opt.id;
    this.title = opt.title;
    this.preview = opt.preview;
    this.source = opt.source;
    this.origin = opt.origin;
    this.topics = opt.topics || [];
    this.created = opt.created || new Date();
  }

  /** @constant {object} - Constraints on Article instance properties */
  static constraints = {
    id: {
      numericality: { greaterThanOrEqualTo: 0, strict: true },
    },
    source: {
      numericality: { greaterThanOrEqualTo: 0, strict: true },
      presence: true,
    },
    title: {
      type: "string",
      presence: { allowEmpty: false },
    },
    preview: {
      type: "string",
      presence: { allowEmpty: false },
    },
    origin: {
      type: "string",
      presence: { allowEmpty: false },
    },
    created: { datetime: true },
    topics: { stringArray: true },
    exists: { type: "boolean" },
  };
}

/** Article with persistence capability via the perseest package
 * @extends VolatileArticle
 */
class Article extends Perseest.Mixin(VolatileArticle) {
  /** @lends Article */
  /** Create a new persistent article */
  constructor(opt = {}) {
    super(opt);
    this.exists = opt.exists || false;
  }

  /** Multiplex articles, with a single country
   * @param {object} opt - Constructor parameters
   * @param {number} opt.uid - Reference user ID
   * @param {string} opt.topic - Topic to multiplex
   * @param {Array<string>} opt.countries - Countries to multiplex
   * @param {boolean} opt.oauth - Multiplex for OAuth users?
   * @returns {Array<Article>} An ordered collection of articles
   */
  static async multiplex({ uid, topic, countries, oauth } = {}) {
    const queryName = oauth ? "multiplexOAuth" : "multiplex";
    let allNews = [];
    for (const country of countries) {
      const news = await this.db.queries.run(queryName, {
        conf: Article.db,
        user: uid,
        topic,
        country,
      });
      allNews = allNews.concat(news);
    }
    return allNews.sort((a, b) => b.score - a.score);
  }

  /** Database configuration for perseest */
  static db = new Perseest.Config("Article", "id", [
    ["id", { serial: true, id: true }],
    "title",
    "source",
    "preview",
    "origin",
    "topics",
    "created",
  ]);
}

Article.db.row2Entity = (row) =>
  new Article(Object.assign(row, { exists: true }));

// Add format and parser to use validate.js datetime
Validable.validate.extend(Validable.validate.validators.datetime, {
  parse: (value) => new Date(value).valueOf(),
  format: (value) => new Date(value),
});

modHelpers.setIDAfterSaving(Article, "id");
modHelpers.tm2DateAfterFetch(Article, "created");
modHelpers.validateBeforeQuery(Article);

// Multiplex articles at database level by a single topic and country
Article.db.queries.create({
  name: "multiplex",
  type: "multiple",
  generate: ({ user, topic, country }) => {
    return {
      text: "SELECT * FROM multiplex($1::INTEGER,$2::TEXT,$3::TEXT)",
      values: [user, topic, country],
    };
  },
});

// Add feedback score to multiplexed articles
Article.db.addHook("after", "multiplex", (params) => {
  params.ret = params.ret.map((e, idx) => {
    const art = params.conf.row2Entity(e);
    art.score = params.res.rows[idx].score;
    return art;
  });
});

// Same thing for OAuth users
Article.db.queries.create({
  name: "multiplexOAuth",
  type: "multiple",
  generate: ({ user, topic, country }) => {
    return {
      text: "SELECT * FROM multiplex_oauth($1::INTEGER,$2::TEXT,$3::TEXT)",
      values: [user, topic, country],
    };
  },
});

// Add feedback score to multiplexed articles
Article.db.addHook("after", "multiplexOAuth", (params) => {
  params.ret = params.ret.map((e, idx) => {
    const art = params.conf.row2Entity(e);
    art.score = params.res.rows[idx].score;
    return art;
  });
});

module.exports = { VolatileArticle, Article };
