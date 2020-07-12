/** echelonews - Passport configuration
 * @license
 * Copyright (c) 2020 Nicola Colao, Paolo Lucchesi, Dejan Nuzzi
 * All rights reserved
 * This software is licensed under the MIT license found in the file LICENSE
 * in the root directory of this repository
 */
'use strict'
const fetch = require('node-fetch')
const Jwt = require('jsonwebtoken')
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const Validable = require('validable')

/** Own-rolled authorization framework for the EcheloNews API */
class AuthStar {
  /** Setup Authorization framework
   * @param {object} opt - Function parameters
   * @param {object} opt.log - Pino logger used by the application
   * @param {string} opt.userHandlerUrl - URL to the User Handler API
   * @returns {Class} The AuthStar class
   */
  static setup({ log, userHandlerUrl, jwtSecret } = {}) {
    this.log = log
    this.userHandlerUrl = userHandlerUrl
    this.jwtSecret = jwtSecret
    passport.use('login', this.loginStrategy)
    return this
  }

  /** Passport strategy for local users login */
  static loginStrategy = new LocalStrategy({
    usernameField: 'name',
    passwordField: 'pass',
  }, (async function(name, pass, done) {
    AuthStar.log.trace('Starting passport login strategy callback')
    try {
      const res = await fetch(AuthStar.userHandlerUrl + '/auth', {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, pass }),
      })
      const status = res.status, body = await res.json()
      switch (status) {
        case 200:
          AuthStar.log.info(`Login attempt successful for user ${body.id} (${body.name})`)
          done(null, body)
          break
        case 400:
        case 404:
          AuthStar.log.warn(`Login attempt failed (user handler returned ${status})\n%o`, body)
          done(null, false, { status: status === 404 ? 401 : status, errors: body })
          break
        default:
          done(body)
          break
      }
    } catch (err) {
      AuthStar.log.error(err)
      done(err)
    }
  }))

  /** Express/Connect middleware for local users login */
  static loginMidware = function(req, res) {
    const errs = Validable.merge(
      Validable.requirelist(req.body, ['name', 'pass']),
      Validable.whitelist(req.body, ['name', 'pass'])
    )
    if (errs) {
      AuthStar.log.warn('Malformed login request\n%o', errs)
      return res.status(400).json({ errors: errs })
    }

    passport.authenticate('login', { session: false }, function(err, user, info) {
      if (err) {
        return res.status(500).json({ message: 'Internal server error. Sorry '})
      } else if (!user) {
        return res.status(info.status).send(info.errors)
      } else {
        return res.status(200).json({ token: Jwt.sign({
          user: {
            id: user.id
          }
        }, AuthStar.jwtSecret) })
      }
    })(req, res)
  }

  /** Express/Connect middleware for user authorization via Json Web Tokens */
  static jwtMidware(req, res, next) {
    const token = (req.header('Authorization') || '').substr('Bearer '.length)
    try {
      const payload = Jwt.verify(token, AuthStar.jwtSecret)
      req.user = payload.user
      next()
    } catch (err) {
      AuthStar.log.warn(`Invalid bearer token ${token}`)
      res.status(401).json({ message: 'Invalid bearer token' })
    }
  }

  /** Express/Connect middleware for local users registration */
  static async registerMidware(req, res) {
    const errs = Validable.merge(
      Validable.requirelist(req.body, ['name', 'email', 'pass']),
      Validable.whitelist(req.body, ['name', 'email', 'pass'])
    )
    if (errs) {
      AuthStar.log.warn('Malformed login request\n%o', errs)
      return res.status(400).json({ errors: errs })
    }

    // Try registering to the user handler
    try {
      const hndRes = await fetch(AuthStar.userHandlerUrl + '/register', {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req.body)
      })
      const hndBody = await hndRes.json()
      if (hndRes.ok) {
        AuthStar.log.info(`Successfully registered user of id ${hndBody}`)
        res.status(200).json({ token: Jwt.sign({
          user: {
            id: hndBody.id
          }
        }, AuthStar.jwtSecret) })
      } else if (hndRes.status >= 500) {
        AuthStar.log.warn(hndBody)
        res.status(500).json({ message: 'Internal server error. Sorry '})
      }
      else {
        AuthStar.log.warn('User handler returned error\n%o', hndBody)
        res.status(hndRes.status).json(hndBody)
      }
    } catch (err) {
      throw err
    }
  }

  /** AuthStar middlewares */
  static middlewares = {
    jwt: this.jwtMidware, /** JWT-based authorization middleware */
    login: this.loginMidware, /** Login middleware */
    register: this.registerMidware, /** Registration middleware */
  }
}

module.exports = AuthStar
