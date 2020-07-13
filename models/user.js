/** echelonews - User model
 * @requires validable
 * @requires perseest
 * @requires bcrypt
 * @license
 * Copyright (c) 2020 Nicola Colao, Paolo Lucchesi, Dejan Nuzzi
 * All rights reserved
 * This software is licensed under the MIT license found in the file LICENSE
 * in the root directory of this repository
 */
"use strict";
const Validable = require("validable");
const Perseest = require("perseest");
const bcrypt = require("bcrypt");
const modHelpers = require("../lib/models-helpers");
Object.assign(Validable.validate.validators, require("../lib/validators"));

/** User entity, with no support for persistence */
class VolatileUser extends Validable.Class {
  /** Instantiate a new User
   * @param {object} opt - Constructor parameters
   * @param {number} opt.id - User univocal ID
   * @param {string} opt.name - Username
   * @param {string} opt.email - User e-mail
   * @param {string} opt.pass - User plaintext password
   * @param {string} opt.hash - User hashed password
   * @param {Date} opt.created - User creation timestamp
   * @param {Array<String>} opt.countries - Countries in the user preferences
   * @param {Array<String>} opt.topics - Countries in the user preferences
   */
  constructor(opt = {}) {
    super();
    this.id = opt.id;
    this.name = opt.name;
    this.pass = opt.pass;
    this.hash = opt.hash;
    this.lang = "en";
    this.email = opt.email;
    this.topics = opt.topics || [];
    this.countries = opt.countries || [];
    this.created = opt.created || new Date();
  }

  /** Create a user, hashing its plaintext password if given
   * @param {object} opt - Creation parameters, as for the User constructor
   * @returns {VolatileUser} A new class instance
   */
  static async create(opt = {}) {
    const user = new this(opt);
    if (opt.pass && !opt.hash) await user.setPassword(opt.pass);
    return user;
  }

  /** Return a string representation of the user */
  toString() {
    return `User ${this.id} (${this.name} - ${this.email})`;
  }

  /** @returns {object} A sharing-safe representation of this user */
  export() {
    return {
      id: this.id,
      name: this.name,
      lang: this.lang,
      email: this.email,
      topics: this.topics,
      created: this.created,
      countries: this.countries,
    };
  }

  /** Set user password
   * @param {string} pass - Plaintext password
   * @throws Password must be valid
   * @returns {undefined}
   */
  async setPassword(pass) {
    const verrors = this.constructor.validate("pass", pass);
    if (verrors) throw new Validable.Error(verrors);
    this.hash = await bcrypt.hash(pass, this.constructor.BCRYPT_SALT_ROUNDS);
  }

  /** Authenticate a user with a password
   * @param {string} pass - User password
   * @returns {Promise<boolean>} true if given password matches, false otherwise
   */
  authenticate(pass) {
    return bcrypt.compare(pass, this.hash);
  }

  /** @constant {object} - Constraints on User instance properties */
  static constraints = {
    id: {
      numericality: { greaterThanOrEqualTo: 0, strict: true },
    },
    name: {
      type: "string",
      length: { minimum: 6, maximum: 24 },
      presence: { allowEmpty: false },
      format: { pattern: /[a-z0-9\-_]+/i },
    },
    lang: {
      languageCode: true,
    },
    email: {
      type: "string",
      email: true,
      presence: { allowEmpty: false },
    },
    pass: {
      type: "string",
      length: { minimum: 8, maximum: 72 },
    },
    hash: {
      type: "string",
      format: /\$2[aby]?\$\d{1,2}\$[.\/a-zA-Z0-9]{53}/, // bcrypt hash format
    },
    created: {
      datetime: true,
    },
    exists: { type: "boolean" },
    topics: { stringArray: true },
    countries: { countryCodeArray: true },
  };

  /** @constant {number} - BCrypt hash cost */
  static BCRYPT_SALT_ROUNDS = process.env.ENVIRONMENT === "test" ? 1 : 10;
}

/** User with persistence capability via the perseest package
 * @extends VolatileUser
 */
class User extends Perseest.Mixin(VolatileUser) {
  /** @lends User */
  /** Create a new persistent user */
  constructor(opt = {}) {
    super(opt);
    this.exists = opt.exists || false;
  }

  /** Database configuration for perseest */
  static db = new Perseest.Config("Account", "id", {
    id: { id: true, serial: true },
    name: { id: true },
    email: { id: true },
    hash: null,
    lang: null,
    countries: null,
    topics: null,
    created: null,
  });
}

User.db.row2Entity = (row) => new User(Object.assign(row, { exists: true }));

// Get fields usable as a univocal ID
User.db.ids = function* () {
  for (const [c, a] of User.db.columns) if (a && a.id) yield c;
};

modHelpers.setIDAfterSaving(User, "id");
modHelpers.tm2DateAfterFetch(User, "created");
modHelpers.validateBeforeQuery(User);

// Add format and parser to use validate.js datetime
Validable.validate.extend(Validable.validate.validators.datetime, {
  parse: (value) => new Date(value).valueOf(),
  format: (value) => new Date(value),
});

module.exports = { User, VolatileUser };
