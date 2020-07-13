/** echelonews - Newspaper model(s)
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
const { countries } = require("countries-list");
Object.assign(Validable.validate.validators, require("../lib/validators"));

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
    super();
    this.id = opt.id;
    this.sourceType = opt.sourceType;
    this.country = opt.country;
    this.info = opt.info;
  }

  /** Get the language of the newspaper origin country
   * @returns {string} The language code for the newspaper
   */
  language() {
    return countries[this.country].languages[0];
  }

  /** @constant {object} - Constraints on Newspaper instance properties */
  static constraints = {
    id: {
      numericality: { greaterThanOrEqualTo: 0, strict: true },
    },
    sourceType: {
      type: "string",
      presence: { allowEmpty: false },
    },
    country: { countryCode: true },
    info: { type: "object" },
    exists: { type: "boolean" },
  };
}

/** Newspaper with persistence capability via the perseest package
 * @extends VolatileNewspaper
 */
class Newspaper extends Perseest.Mixin(VolatileNewspaper) {
  /** @lends Newspaper */
  /** Create a new persistent newspaper */
  constructor(opt = {}) {
    super(opt);
    this.exists = opt.exists || false;
  }

  /** Database configuration for perseest */
  static db = new Perseest.Config("Newspaper", "id", [
    ["id", { serial: true, id: true }],
    "sourceType",
    "country",
    "info",
  ]);
}

Newspaper.db.row2Entity = (row) =>
  new Newspaper(Object.assign(row, { exists: true }));

modHelpers.setIDAfterSaving(Newspaper, "id");
modHelpers.validateBeforeQuery(Newspaper);

module.exports = { VolatileNewspaper, Newspaper };
