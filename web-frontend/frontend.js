/** echelonews - Web frontend
 * @license
 * Copyright (c) 2020 Nicola Colao, Paolo Lucchesi, Dejan Nuzzi
 * All rights reserved
 */
'use strict'
const express = require('express')
const cookieParser = require('cookie-parser')
const fetch = require('node-fetch')
const Parser = require('body-parser')
const pino = require('pino')
const pinoExpress = require('express-pino-logger')
const { countries, languages } = require('countries-list')
const OAuth = require('./oauth')

// Sort languages in a handy array
const sortedLangs = Object.entries(languages)
  .map(([code, props]) => Object.assign({ code }, props))
  .sort((a, b) => a.name.localeCompare(b.name))

// Sort countries in a handy array
const sortedCountries = Object.entries(countries)
  .map(([code, props]) => Object.assign({ code }, props))
  .sort((a, b) => a.name.localeCompare(b.name))

// Environment variables
const API_URL = process.env.API_URL
const OAUTH_BRIDGE_URL = process.env.OAUTH_BRIDGE_URL
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET

// Express middlewares
const formDecoder = Parser.urlencoded({ extended: false })
const log = pino({ level: process.env.LOG_LEVEL || 'info' })

// Express application
const app = express()
app.set('view engine', 'ejs')
app.use(express.static('assets'))
app.use(cookieParser())
app.use(pinoExpress({ logger: log, useLevel: 'trace' }))

// Homepage
app.get('/', (req, res) => {
  req.log.info('Requested homepage')
  res.render('index', { user: !!(req.cookies.jwt) })
})

// Login page
app.get('/login', (req, res) => {
  req.log.info('Requested login page')
  res.render('login', { user: !!(req.cookies.jwt) })
})

// Login request
app.post('/login', formDecoder, async (req, res) => {
  req.log.info('Login request')
  try {
    const apiRes = await fetch(`${API_URL}/login`, {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    })
    const body = await apiRes.json()
    switch (apiRes.status) {
      case 200:
        req.log.info('Successfully logged in')
        res.cookie('jwt', `Bearer ${body.token}`, { maxAge: 3600000 })
        return res.redirect('/profile')
      case 400:
        req.log.warn('Malformed login request')
        return res.status(400).redirect('/login') // TODO: Flash
      case 401:
        req.log.warn('Login incorrect')
        return res.status(400).redirect('/login') // TODO: Flash (with some other message)
      default:
        req.log.error(`Unexpected API response status code ${apiRes.status}`)
        return res.render('5xx', { user: !!(req.cookies.jwt) })
    }
  } catch (err) {
    req.log.error(err)
    return res.render('5xx', { user: !!(req.cookies.jwt) })
  }
})

// Signup page
app.get('/register', (req, res) => {
  req.log.info('Requested registration page')
  res.render('register', { user: !!(req.cookies.jwt) })
})

// Signup request
app.post('/register', formDecoder, async (req, res) => {
  req.log.info('Signup request')
  try {
    const apiRes = await fetch(`${API_URL}/register`, {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    })
    const body = await apiRes.json()
    switch (apiRes.status) {
      case 200:
        req.log.info('Successfully signed up')
        res.cookie('jwt', `Bearer ${body.token}`, { maxAge: 3600000 })
        return res.redirect('/profile')
      case 400:
        req.log.warn('Malformed signup request')
        return res.status(400).redirect('/register') // TODO: Flash
      case 403:
        req.log.info('Signup forbidden')
        return res.status(403).redirect('/register') // TODO: Flash (with some other message)
      default:
        req.log.error(`Unexpected API response status code ${apiRes.status}`)
        return res.render('5xx', { user: !!(req.cookies.jwt) })
    }
  } catch (err) {
    req.log.error(err)
    return res.render('5xx', { user: !!(req.cookies.jwt) })
  }
})

// OAuth login
app.get('/oauth', OAuth.directPath)

// OAuth login callback
app.get('/oauth/callback', OAuth.callbackPath)

// Logout
app.get('/logout', (req, res) => {
  disposeSession(res)
  res.redirect('/')
})

// Show user profile
app.get('/profile', tokenMiddleware, async (req, res) => {
  req.log.info('Requested profile page')
  try {
    const apiRes = await fetch(`${API_URL}/profile`, {
      method: 'get',
      headers: { 'Authorization': req.cookies.jwt }
    })
    const body = await apiRes.json()
    switch(apiRes.status) {
      case 200:
        req.log.debug('Got user profile\n%o', body)
        return res.render('profile', {
          user: true,
          profile: body,
          langs: sortedLangs,
          countries,
          sortedCountries,
        })
      case 401:
        disposeSession(res)
        return res.redirect('login') // TODO: Flash 'You are not authenticated'
      default:
        req.log.error(`Unexpected API response status code ${apiRes.status}`)
        return res.render('5xx', { user: !!(req.cookies.jwt) })
    }
  } catch (err) {
    req.log.error(err)
    return res.render('5xx', { user: !!(req.cookies.jwt) })
  }
})

// Update user profile
app.post('/profile', tokenMiddleware, formDecoder, async (req, res) => {
  req.log.info('Attempting to update profile')
  try {
    if (!req.body.pass) delete req.body.pass

    if (req.body.countries) req.body.countries = req.body.countries.split(',')
    else req.body.countries = []

    if (req.body.topics) req.body.topics = req.body.topics.split(',')
    else req.body.topics = []

    req.log.debug('Update profile body is %o', req.body)

    const apiRes = await fetch(`${API_URL}/profile`, {
      method: 'put',
      headers: {
        'Authorization': req.cookies.jwt,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body)
    })
    if (!apiRes.ok) throw new Error(`PUT /profile returned code ${apiRes.status})`)
    req.log.info('Successfully updated profile')
    res.redirect('/profile')
  } catch (err) {
    req.log.error(err)
    return res.render('5xx', { user: !!(req.cookies.jwt) })
  }
})

// Multiplexed news, according to user settings
app.get('/news', tokenMiddleware, (req, res) => {
  req.log.info('Requested news page (with simple GET)')
  res.render('news', {
    user: !!(req.cookies.jwt),
    langs: sortedLangs,
    sortedCountries: sortedCountries,
    countries: countries,
    news: []
  })
})

// Multiplexed news, according to a custom multiplex request
app.post('/news', tokenMiddleware, formDecoder, async (req, res) => {
  req.log.info('Attempting to fetch news with custom multiplexer parameters')
  req.log.debug('Body is %o', req.body)
  if (req.body.countries) req.body.countries = req.body.countries.split(',')
  else req.body.countries = []
  try {
    const apiRes = await fetch(`${API_URL}/news`, {
      method: 'post',
      headers: {
        'Authorization': req.cookies.jwt,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(req.body)
    })
    const body = await apiRes.json()
    switch(apiRes.status) {
      case 200:
        req.log.info(`Got ${body.length} news`)

        // Fetch newspapers
        // TODO: Handle errors
        const npaperIds = new Set(body.map(x => x.source))
        const npapers = new Map()
        for (const id of npaperIds) {
          if (!npapers.has(id)) {
            const np = await fetch(`${API_URL}/newspaper/${id}`, {
              method: 'get',
              headers: { 'Authorization': req.cookies.jwt }
            })
            if (!np.ok) throw new Error(`Unable to fetch newspaper ${id}`)
            npapers.set(id, await np.json())
          }
        }

        // Map news to be handled in a more elegant way
        const news = body.map(n => {
          const npaper = npapers.get(n.source)
          return Object.assign({}, n, {
            country: npaper.country,
            npaper: {
              id: npaper.id,
              title: npaper.info.title,
            }
          })
        })
        log.debug('Mapped news are %o', news)

        return res.render('news', {
          user: !!(req.cookies.jwt),
          langs: sortedLangs,
          countries,
          sortedCountries,
          news
        })
      case 401:
        disposeSession(res)
        return res.redirect('login') // TODO: Flash 'You are not authenticated'
      default:
        req.log.error(`Unexpected API response status code ${apiRes.status}`)
        return res.render('5xx', { user: !!(req.cookies.jwt) })
    }
  } catch (err) {
    req.log.error(err)
    return res.render('5xx', { user: !!(req.cookies.jwt) })
  }
})

// Update a feedback
app.put('/feedback', tokenMiddleware, formDecoder, async (req, res) => {
  try {
    const apiRes = await fetch(`${API_URL}/feedback`, {
      method: 'put',
      headers: {
        'Authorization': req.cookies.jwt,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        npaper: parseInt(req.body.npaper),
        score: parseInt(req.body.score),
      })
    })
    req.log.info(`PUT feedback request returned status code ${apiRes.status}`)
    return res.sendStatus(apiRes.status)
  } catch (err) {
    req.log.error(err)
    return res.sendStatus(500)
  }
})

// Page not found -- THIS MUST BE THE LAST ROUTE!!!
app.get('*', (req, res) => {
  req.log.warn('Attempted to GET inexistent route')
  res.render('404', { user: !!(req.cookies.jwt) })
})

// Authentication middleware
// Turns the 'jwt' cookie into a Json Web Token, or redirects if the cookie is not present
function tokenMiddleware(req, res, next) {
  if (!req.cookies || !req.cookies.jwt) {
    req.log.warn('Attempted to access protected route without a jwt cookie')
    return res.redirect('/login')
  }
  console.log(req.cookies.jwt)
  next()
}

// Dispose a JWT session cookie
function disposeSession(res) {
  res.cookie('jwt', '', {
    expires: new Date(0),
    overwrite: true
  })
}

// Perform the required setup operations and launch the server
app.launch = function({ port = 8080 } = {}) {
  if (!API_URL) log.warn('API_URL was not given - The API is unreachable')
  if (!OAUTH_BRIDGE_URL) log.warn('OAUTH_BRIDGE_URL was not given - OAuth cannot be used')
  OAuth.setup({
    oauthBridge: OAUTH_BRIDGE_URL,
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    log,
  })
  app.listen(port, () => log.info(`Server listening on port ${port}`))
}

// If this is the main module, launch the web frontend
if (require.main === module) {
  log.debug('Launching EcheloNews Web Frontend in standalone mode')
  app.launch({ port: process.env.PORT })
}

module.exports = app
