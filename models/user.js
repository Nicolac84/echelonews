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
'use strict'
const Validable = require('validable')
const Perseest = require('perseest')
const bcrypt = require('bcrypt')

class VolatileUser extends Validable.Class {
  /** User entity, with no support for persistence
   * NOTE: The constructor will assign any other property included in 'opt'
   * @param {object} opt - Constructor parameters
   * @param {number} opt.id - User univocal ID
   * @param {string} opt.name - Username
   * @param {string} opt.email - User e-mail
   * @param {string} opt.pass - User plaintext password
   * @param {string} opt.hash - User hashed password
   * @param {Date} opt.created - User creation timestamp
   * @param {number} opt.googleId - Google account ID for the user
   */
  constructor(opt = {}) {
    super()
    Object.assign(this, { created: new Date() }, opt)
  }

  /** Create a user, hashing its plaintext password if given
   * @param {object} opt - Creation parameters, as for the User constructor
   * @returns {VolatileUser} A new class instance
   */
  static async create(opt = {}) {
    const user = new this(opt)
    if (opt.pass && !opt.hash) await user.setPassword(opt.pass)
    return user
  }

  /** Return a string representation of the user */
  toString() {
    return `User ${this.id} (${this.name} - ${this.email})`
  }

  /** Set user password
   * @param {string} pass - Plaintext password
   * @throws Password must be valid
   * @returns undefined
   */
  async setPassword(pass) {
    const verrors = this.constructor.validate('pass', pass)
    if (verrors) throw new Validable.Error(verrors)
    this.hash = await bcrypt.hash(pass, this.constructor.BCRYPT_SALT_ROUNDS)
  }

  /** Authenticate a user with a password
   * @param {string} pass - User password
   * @returns {Promise<boolean>} true if given password matches, false otherwise
   */
  authenticate(pass) {
    return bcrypt.compare(pass, this.hash)
  }

  // TODO: Test
  /** Fetch a user from the database, for a passport.js strategy
   * @param {string} user - Username
   * @param {string} pass - User password
   * @param {function} done - Result forwarding callback
   */
  static async fetchForPassport(name, pass, done) {
    try {
      const user = await this.fetch('name', name)
      if (!user) return done(null, false, { message: 'Login incorrect' })

      // TODO: Change message to 'Login incorrect'?
      const authenticated = await user.authenticate(pass)
      if (!authenticated)
        return done(null, false, { message: 'Password incorrect' })

      return done(null, user)
    } catch (err) {
      return done(err)
    }
  }

  /** @constant {object} - Constraints on User instance properties */
  static constraints = {
    id: {
      numericality: { greaterThanOrEqualTo: 0, strict: true },
    },
    name: {
      type: 'string',
      length: { minimum: 6, maximum: 24 },
      presence: { allowEmpty: false },
      format: { pattern: /[a-z0-9\-_]+/i },
    },
    email: {
      type: 'string',
      email: true,
      presence: { allowEmpty: false },
    },
    exists: { type: 'boolean' },
    pass: {
      type: 'string',
      length: { minimum: 8, maximum: 72 },
    },
    hash: {
      type: 'string',
      format: /\$2[aby]?\$\d{1,2}\$[.\/a-zA-Z0-9]{53}/, // bcrypt hash format
    },
    created: {
      datetime: true,
    },
  }

  /** @constant {number} - BCrypt hash cost */
  static BCRYPT_SALT_ROUNDS = process.env['ENVIRONMENT'] === 'test' ? 1 : 12
}

class User extends Perseest.Mixin(VolatileUser) {
  static db = new Perseest.Config('Account', 'id', {
    id: { id: true, serial: true },
    name: { id: true },
    email: { id: true },
    hash: null,
    countries: null,
    topics: null,
    created: null,
  })
}

// Get fields usable as a univocal ID
User.db.ids = function* () {
  for (const [c, a] of User.db.columns) if (a && a.id) yield c
}

// Update validator
function dbUpdateValidator({ columns, values }) {
  const props = {}
  for (let i = 0; i < columns.length; ++i) props[columns[i]] = values[i]
  const errs = User.validateObject(props, true)
  if (errs) throw new Validable.Error(errs)
}

// Save validator
function dbSaveValidator({ ent }) {
  const errs = ent.validate()
  if (errs) throw new Validable.Error(errs)
}

// Delete validator (static and instance)
function dbFetchDeleteValidator({ key, kval }) {
  const errs = User.validate(key, kval)
  if (errs) throw new Validable.Error(errs)
}

// Override default save query
User.db.queries.create({
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
User.db.addHook('after', 'save', params => {
  if (!params.res.rows.length) params.ret = false
  params.ent.id = params.res.rows[0].id
  params.ret = true
})

// Convert 'created' timestamp in a Date JS object
User.db.addHook('after', 'fetch', params => {
  if (params.ent) params.ent.created = new Date(params.ent.created)
})

// Validate users fields before performing queries on them
User.db.addHook('before', 'save', dbSaveValidator)
User.db.addHook('before', 'update', dbUpdateValidator)
User.db.addHook('before', 'fetch', dbFetchDeleteValidator)
User.db.addHook('before', 'delete', dbFetchDeleteValidator)

// Add format and parser to use validate.js datetime
Validable.validate.extend(Validable.validate.validators.datetime, {
  parse: value => new Date(value).valueOf(),
  format: value => new Date(value),
})

module.exports = { User, VolatileUser }
