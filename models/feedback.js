/** echelonews - Feedback model
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

/** User feedback, with no persistence support */
class VolatileFeedback extends Validable.Class {
  /** Create a new feedback
   * @param {object} opt - Constructor parameters
   * @param {number} opt.account - Related user id
   * @param {number} opt.npaper - Related newspaper ID
   * @param {number} opt.score - Newspaper score
   */
  constructor({ account, npaper, score=0 } = {}) {
    this.account = account
    this.npaper = npaper
    this.score = score
  }

  /** @constant {object} - Constraints on Feedback instance properties */
  static constraints = {
    id: {
      numericality: { greaterThanOrEqualTo: 0, strict: true },
    },
    account: {
      numericality: { greaterThanOrEqualTo: 0, strict: true },
      presence: true,
    },
    npaper: {
      numericality: { greaterThanOrEqualTo: 0, strict: true },
      presence: true,
    },
    score: {
      numericality: { greaterThanOrEqualTo: 0, strict: true },
      presence: true,
    }
  }
}

/** Feedback with persistence capability via the perseest package
 * @extends VolatileFeedback
 */
class Feedback extends Perseest.Mixin(VolatileFeedback) {
  /** @lends Feedback */
  /** Create a new persistent article */
  constructor(opt = {}) {
    super(opt)
    this.exists = opt.exists || false
  }

  /** Database configuration for perseest */
  static db = new Perseest.Config('Feedback', 'id', [
    ['id', { serial: true, id: true }], 'account', 'npaper', 'score'
  ])
}

Feedback.db.row2Entity = row => new Feedback(Object.assign(row, { exists: true }))

// Add format and parser to use validate.js datetime
Validable.validate.extend(Validable.validate.validators.datetime, {
  parse: value => new Date(value).valueOf(),
  format: value => new Date(value),
})

modHelpers.setIDAfterSaving(Feedback, 'id')
modHelpers.validateBeforeQuery(Feedback)

module.exports = { VolatileFeedback, Feedback }
