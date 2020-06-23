/** echelonews - Passport configuration
 * @license
 * Copyright (c) 2020 Nicola Colao, Paolo Lucchesi, Dejan Nuzzi
 * All rights reserved
 */
'use strict'
const Jwt = require('jsonwebtoken')
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy

const userHandlerUrl = process.env.USER_HANDLER_URL
const jwtSecret = process.env.JWT_SECRET

const pino = require('pino')
const log = pino({ level: process.env.LOG_LEVEL || 'info' })

const loginStrategy = new LocalStrategy({
  usernameField: 'name',
  passwordField: 'pass',
}, (name, pass, done) => {
  fetch(userHandlerUrl + '/login', {
    method: 'post',
    headers: { 'Content-Type': 'application-json' },
    body: JSON.stringify({ name, pass })
  }).then(res => {
    switch (res.status) {
      case 200:
        res.json().then(user => done(null, user))
        break
      case 400:
      case 404:
        res.json().then(errs => done(null, false, {
          status: res.status,
          errors: errs
        }))
        break
      default:
        res.json().then(err => done(err))
        break
    }
  }).catch(err => done(err))
})

function jwtMiddleware(req, res, next) {
  const token = req.header('Authorization');
  try {
    const payload = Jwt.verify(token, jwtSecret);
    req.user = payload.user;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid bearer token' });
  }
}

passport.use('login', loginStrategy)

module.exports = {
  passport,
  midwares: {
    jwt: jwtMiddleware,
  },
  strategies: {
    local: loginStrategy,
  },
}
