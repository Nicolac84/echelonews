/** echelonews - Article model
 * @requires validable
 * @requires perseest
 * @license
 * Copyright (c) 2020 Nicola Colao, Paolo Lucchesi, Dejan Nuzzi
 * All rights reserved
 * This software is licensed under the MIT license found in the file LICENSE
 * in the root directory of this repository
 */
'use strict'
const Validable = require('validable')
const Perseest = require('perseest')

/** Article, with no persistence support */
class VolatileArticle extends Validable.Class {
  /** Instantiate a new Article
   * @param {object} opt - Constructor parameters
   * @param {integer} opt.id - Article univocal ID
   * @param {integer} opt.source - Article newspaper
   * @param {string} opt.title - Article title
   * @param {string} opt.preview - Article short description
   * @param {string} opt.origin - Reference URL to the full article
   * @param {Array>string>} opt.topics - Treated topics
   * @param {Date} opt.created - Article creation date and time
   */
  constructor(opt = {}) {
    super()
    this.id = opt.id
    this.title = opt.title
    this.preview = opt.preview
    this.source = opt.source
    this.origin = opt.origin
    this.topics = opt.topics || []
    this.created = opt.created || new Date()
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
      type: 'string',
      presence: { allowEmpty: false },
    },
    preview: {
      type: 'string',
      presence: { allowEmpty: false },
    },
    origin: {
      type: 'string',
      presence: { allowEmpty: false },
    },
    created: { datetime: true },
    exists: { type: 'boolean' },
  }
}

/** Article with persistence capability via the perseest package
 * @extends VolatileArticle
 */
class Article extends Perseest.Mixin(VolatileArticle) {
  /** @lends Article */
  /** Create a new persistent article */
  constructor(opt) {
    super(opt)
    if (opt.exists) this.exists = opt.exists
  }

  /** Database configuration for perseest */
  static db = new Perseest.Config('Article', 'id', [
    ['id', { serial: true, id: true }],
    'title',
    'source',
    'preview',
    'origin',
    'topics',
    'created',
  ])
}

// Add format and parser to use validate.js datetime
Validable.validate.extend(Validable.validate.validators.datetime, {
  parse: value => new Date(value).valueOf(),
  format: value => new Date(value),
})

// Override default save query
Article.db.queries.create({
  name: 'save',
  transform: ({ res }) => res.rows[0],
  generate: ({ conf, ent, columns }) => {
    const [cols, vals] = Perseest.aux.entityCV(ent, columns)
    return {
      text: `INSERT INTO ${conf.table} (
  ${cols.join(', ')}
) VALUES (
  ${Perseest.aux.placeholders(cols.length)}
) RETURNING id`,
      values: vals,
    }
  },
})

// Retrieve and apply user ID after insertion
Article.db.addHook('after', 'save', params => {
  if (!params.res.rows.length) params.ret = false
  params.ent.id = params.res.rows[0].id
  params.ret = true
})

// Convert 'created' timestamp in a Date JS object
Article.db.addHook('after', 'fetch', params => {
  if (params.ent) params.ent.created = new Date(params.ent.created)
})

module.exports = { VolatileArticle, Article }
