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
const modHelpers = require('./helpers/perseest')

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
    topics: { type: 'array' },
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

modHelpers.setIDAfterSaving(Article, 'id')
modHelpers.tm2DateAfterFetch(Article, 'created')
modHelpers.validateBeforeQuery(Article)

module.exports = { VolatileArticle, Article }
