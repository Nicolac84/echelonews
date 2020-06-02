/** echelonews - Newspaper model(s)
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

/** Newspaper, with no persistence support */
class VolatileNewspaper extends Validable.Class {
  /** Instantiate a new Newspaper
   * @param {object} opt - Constructor parameters
   * @param {integer} opt.id - Newspaper univocal ID
   * @param {string} sourceType - Newspaper type (e.g. RSS, Website...)
   * @param {string} country - Newspaper origin country
   * @param {object} info - Additional metadata for the newspaper
   */
  constructor(opt = {}) {
    super()
    this.id = opt.id
    this.sourceType = opt.sourceType
    this.country = opt.country
    this.info = opt.info
  }

  /** @constant {object} - Constraints on Newspaper instance properties */
  static constraints = {
    id: {
      numericality: { greaterThanOrEqualTo: 0, strict: true },
      presence: true
    },
    sourceType: {
      type: 'string',
      presence: { allowEmpty: false }
    },
    country: {
      type: 'string',
      presence: { allowEmpty: false }
    },
    info: { type: 'object' },
  }
}

/** Newspaper with persistence capability via the perseest package
 * @extends VolatileNewspaper
 */
class Newspaper extends Perseest.Mixin(VolatileNewspaper) {
  /** @lends Newspaper */
  /** Database configuration for perseest */
  static db = new Perseest.Config('Newspaper', 'id', [
    ['id', { serial: true, id: true }],
    'sourceType',
    'country',
    'info',
  ])
}

module.exports = { VolatileNewspaper, Newspaper }
