/** echelonews - Feedback model for OAuth accounts
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

/** User feedback, with no persistence support */
class VolatileOAuthFeedback extends Validable.Class {
  /** Create a new feedback
   * @param {object} opt - Constructor parameters
   * @param {number} opt.account - Related OAuth user id
   * @param {number} opt.npaper - Related newspaper ID
   * @param {number} opt.score - Newspaper score
   */
  constructor({ account, npaper, score = 0 } = {}) {
    super();
    this.account = account;
    this.npaper = npaper;
    this.score = score;
  }

  /** Does the feedback belong to an oauth user? (always true)
   * @returns {boolean}
   */
  get oauth() {
    return true;
  }

  /** @constant {object} - Constraints on OAuthFeedback instance properties */
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
      numericality: { strict: true },
      presence: true,
    },
  };
}

/** OAuthFeedback with persistence capability via the perseest package
 * @extends VolatileOAuthFeedback
 */
class OAuthFeedback extends Perseest.Mixin(VolatileOAuthFeedback) {
  /** @lends OAuthFeedback */
  /** Create a new persistent article */
  constructor(opt = {}) {
    super(opt);
    this.id = opt.id;
    this.exists = opt.exists || false;
  }

  /** Database configuration for perseest */
  static db = new Perseest.Config("OAuthFeedback", "id", [
    ["id", { serial: true, id: true }],
    "account",
    "npaper",
    "score",
  ]);

  /** Retrieve a feedback by user/newspaper tuple
   * @param {number} account - User ID
   * @param {number} npaper - Newspaper ID
   * @returns {Promise<OAuthFeedback>} The requested feedback, with a score of 0 if
   *   it does not exist
   */
  static retrieve(account, npaper) {
    return OAuthFeedback.db.queries
      .run("retrieve", {
        conf: OAuthFeedback.db,
        account,
        npaper,
      })
      .then((fb) => fb || new OAuthFeedback({ account, npaper }));
  }
}

// Retrieve a feedback by (account,npaper)
OAuthFeedback.db.queries.create({
  name: "retrieve",
  type: "singular",
  generate: ({ conf, account, npaper }) => ({
    text: `SELECT * FROM ${conf.table} WHERE account = $1 AND npaper = $2`,
    values: [account, npaper],
  }),
});

OAuthFeedback.db.row2Entity = (row) =>
  new OAuthFeedback(Object.assign(row, { exists: true }));

// Add format and parser to use validate.js datetime
Validable.validate.extend(Validable.validate.validators.datetime, {
  parse: (value) => new Date(value).valueOf(),
  format: (value) => new Date(value),
});

modHelpers.setIDAfterSaving(OAuthFeedback, "id");
modHelpers.validateBeforeQuery(OAuthFeedback);

module.exports = { VolatileOAuthFeedback, OAuthFeedback };
