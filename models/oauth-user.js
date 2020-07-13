/** echelonews - OAuthUser model
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

/** OAuth user entity, with no support for persistence */
class VolatileOAuthUser extends Validable.Class {
  /** Instantiate a new OAuthUser
   * @param {object} opt - Constructor parameters
   * @param {number} opt.id - User univocal ID, given by Google
   * @param {string} opt.name - User name, given by Google
   * @param {Date} opt.created - User creation timestamp
   * @param {Array<String>} opt.countries - Countries in the user preferences
   * @param {Array<String>} opt.topics - Countries in the user preferences
   */
  constructor(opt = {}) {
    super();
    this.id = opt.id;
    this.name = opt.name;
    this.lang = "en";
    this.topics = opt.topics || [];
    this.countries = opt.countries || [];
    this.created = opt.created || new Date();
  }

  /** Is the user a OAuth user? (always returns true)
   * @returns {boolean}
   */
  get oauth() {
    return true;
  }

  /** Return a string representation of the user */
  toString() {
    return `Google User ${this.id} (${this.name})`;
  }

  /** @returns {object} A sharing-safe representation of this user */
  export() {
    return {
      id: this.id,
      name: this.name,
      lang: this.lang,
      topics: this.topics,
      created: this.created,
      countries: this.countries,
      oauth: true,
    };
  }

  /** @constant {object} - Constraints on OAuthUser instance properties */
  static constraints = {
    id: {
      numericality: { greaterThanOrEqualTo: 0, strict: true },
    },
    name: {
      type: "string",
      presence: { allowEmpty: false },
    },
    lang: {
      languageCode: true,
    },
    created: {
      datetime: true,
    },
    exists: { type: "boolean" },
    topics: { stringArray: true },
    countries: { countryCodeArray: true },
  };
}

/** OAuthUser with persistence capability via the perseest package
 * @extends VolatileOAuthUser
 */
class OAuthUser extends Perseest.Mixin(VolatileOAuthUser) {
  /** @lends OAuthUser */
  /** Create a new persistent user */
  constructor(opt = {}) {
    super(opt);
    this.exists = opt.exists || false;
  }

  /** Database configuration for perseest */
  static db = new Perseest.Config("OAuthAccount", "id", [
    "id",
    "name",
    "lang",
    "countries",
    "topics",
    "created",
  ]);
}

OAuthUser.db.row2Entity = (row) =>
  new OAuthUser(Object.assign(row, { exists: true }));

// Get fields usable as a univocal ID
OAuthUser.db.ids = function* () {
  for (const [c, a] of OAuthUser.db.columns) if (a && a.id) yield c;
};

modHelpers.tm2DateAfterFetch(OAuthUser, "created");
modHelpers.validateBeforeQuery(OAuthUser);

// Add format and parser to use validate.js datetime
Validable.validate.extend(Validable.validate.validators.datetime, {
  parse: (value) => new Date(value).valueOf(),
  format: (value) => new Date(value),
});

module.exports = { OAuthUser, VolatileOAuthUser };
