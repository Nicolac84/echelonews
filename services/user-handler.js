/** echelonews - User handler module
 * @license
 * Copyright (c) 2020 Nicola Colao, Paolo Lucchesi, Dejan Nuzzi
 * All rights reserved
 */
'use strict'
const express = require('express')
const jsonParser = require('body-parser').json()
const Validable = require('validable')
const { User } = require('../models/user')
const pino = require('pino')
const pinoExpress = require('express-pino-logger')

// Fields which can be written by the API interlocutor
const UPDATE_ALLOWED = new Set(User.db.columns.keys())
;['id', 'hash', 'created'].forEach(x => UPDATE_ALLOWED.delete(x))
UPDATE_ALLOWED.add('pass')

const log = pino({ level: process.env.LOG_LEVEL || 'info' })
const app = express()
app.use(pinoExpress({ logger: log, useLevel: 'trace' }))

// Get metadata for the current user handler server instance
app.get('/', async (req, res) => {
  log.info('Requested user handler status')
  let users
  try {
    const pgRes = await User.db.pool.query('SELECT COUNT(*) AS n FROM Account')
    users = pgRes.rows[0].n
  } catch (err) {
    users = null
  }
  res.status(200).json({
    message: 'EcheloNews User Handler server',
    uptime: process.uptime(),
    platform: process.platform,
    databaseStatus: users === null ? 'Unavailable' : 'Available',
    users: users,
  })
})

// Access users by arbitrary identifier
for (const id of ['id', 'name', 'email']) {
  // Fetch a user by arbitrary field
  app.get(`/users/by${id}/:${id}`, async (req, res) => {
    const idval = decodeURIComponent(req.params[id])

    if (!idval || User.validate(id, idval)) {
      log.info(`Tried to fetch user with invalid ${id} ${idval}`)
      res.status(400).json({ message: `Invalid ${id} ${idval}` })
      return
    }

    try {
      const user = await User.fetch(id, idval)
      if (!user) {
        log.info(`Tried to fetch inexistent user of ${id} ${idval}`)
        res.status(404).send()
      } else {
        log.info(`Successfully fetched user of ${id} ${idval}`)
        res.status(200).json(user)
      }
    } catch (err) {
      log.error(err)
      res.status(500).json({ message: 'Internal database error. Sorry' })
    }
  })

  // Update a user by arbitrary field
  // TODO: Avoid performing 2 queries
  app.put(`/users/by${id}/:${id}`, jsonParser, async (req, res) => {
    const idval = decodeURIComponent(req.params[id])
    if (!idval || User.validate(id, idval)) {
      log.warn(`Tried to update user with invalid ${id} ${idval}`)
      res.status(400).json({ message: `Invalid ${id} ${idval}` })
      return
    }

    const errors = Validable.whitelist(req.body, UPDATE_ALLOWED)
    if (errors) {
      log.warn('Validation error while updating user\n%o', errors)
      res.status(400).json(errors)
      return
    }

    // Attempt to update the user
    try {
      const user = await User.fetch(id, idval)
      if (!user) {
        log.warn(`Tried to update inexistent user of ${id} ${idval}`)
        res.status(404).send()
      }
      else {
        Object.assign(user, req.body)
        if (user.pass) {
          await user.setPassword(user.pass)
        }
        await user.update()
        log.info(`Successfully updated user of ${id} ${idval}`)
        res.status(200).send()
      }
    } catch (err) {
      handleTransactionError(err, res)
    }
  })

  // Delete a user by arbitrary field
  app.delete(`/users/by${id}/:${id}`, async (req, res) => {
    const idval = decodeURIComponent(req.params[id])
    if (!idval || User.validate(id, idval)) {
      log.warn(`Tried to update user with invalid ${id} ${idval}`)
      res.status(400).json({ message: `Invalid ${id} ${idval}` })
      return
    }

    try {
      const deleted = await User.delete(id, idval)
      log.info(`User of ${id} ${idval} ${deleted ? '' : 'not '} deleted`)
      res.status(deleted ? 200 : 404).send()
    } catch (err) {
      log.error(err)
      res.status(500).json({ message: 'Internal database error. Sorry' })
    }
  })
}

// Authenticate with login/password credentials
// TODO: Make possible to authenticate also with email or id
app.post('/auth', jsonParser, async (req, res) => {
  const errors = Validable.merge(
    Validable.requirelist(req.body, ['name', 'pass']),
    Validable.whitelist(req.body, ['name', 'pass']),
    User.validateObject(req.body, true)
  )
  if (errors) {
    res.status(400).json(errors)
    return
  }

  const name = req.body.name
  try {
    const user = await User.fetch('name', name)
    if (user && (await user.authenticate(req.body.pass))) {
      log.info(`Successfully logged in user '${user.name}'`)
      res.status(200).json(user.export())
    } else {
      log.warn(
        `Cannot login user '${name}': incorrect ${user ? 'name' : 'password'}`)
      res.status(404).json({ message: 'Login incorrect' })
    }
  } catch (err) {
    log.error(err)
    res.status(500).json({ message: 'Internal database error. Sorry' })
  }
})

// Attempt to register a new user
app.post('/register', jsonParser, async (req, res) => {
  const errors = Validable.merge(
    Validable.whitelist(req.body, UPDATE_ALLOWED),
    Validable.requirelist(req.body, ['name', 'email', 'pass'])
  )
  if (errors) {
    log.warn('Cannot register user with invalid parameters\n%o', errors)
    res.status(400).json(errors)
    return
  }

  // Attempt to register the user
  try {
    const user = await User.create(req.body)
    await user.save()
    log.info(`Successfully registered user '${user.name}' of id ${user.id}`)
    res.status(201).json(user.export())
  } catch (err) {
    handleTransactionError(err, res)
  }
})

// Handle a database or validation error
function handleTransactionError(err, res) {
  if (err.constructor.name === Validable.Error.name) {
    log.error('Validation error while performing operation\n%o', err.errors)
    res.status(400).json(err.errors)
  } else if (err.code === '23505') {
    // Duplicate key
    const matcher = /.*\(([a-zA-Z0-9]+)\)=\((.+)\).*/
    const dupErr = err.detail.replace(matcher, '$1 $2').split(' ')
    log.warn(`${dupErr[0]} '${dupErr[1]}' is already taken`)
    res
      .status(403)
      .json({ [dupErr[0]]: `${dupErr[0]} '${dupErr[1]}' is already taken` })
  } else {
    log.error(err)
    res.status(500).json({ message: 'Internal database error. Sorry' })
  }
}

// Perform the required setup operations and launch the server
app.launch = function({ postgresUri, port = 8080 } = {}) {
  log.info('Setting up database')
  User.db.setup(postgresUri)
  return app.listen(port, () => log.info(`Server listening on port ${port}`))
}

// If this is the main module, launch the user handler server
if (require.main === module) {
  log.info('Starting User Handler as a standalone server')
  app.launch({
    postgresUri: process.env.POSTGRES_URI,
    port: process.env.PORT
  })
}

module.exports = app
