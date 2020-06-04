/** echelonews - News organizer module
 * @license
 * Copyright (c) 2020 Nicola Colao, Paolo Lucchesi, Dejan Nuzzi
 * All rights reserved
 */
'use strict'
const express = require('express')
const jsonParser = require('body-parser').json()
const Validable = require('validable')
const { Article } = require('../models/article')

// Fields which can be written by the API interlocutor
const UPDATE_ALLOWED = new Set(Article.db.columns.keys())
UPDATE_ALLOWED.delete('id')

const app = express()

// Get metadata for the current user handler server instance
app.get('/', async (req, res) => {
  let articles
  try {
    const pgRes = await Article.db.pool.query(
      'SELECT COUNT(*) AS n FROM Article'
    )
    articles = pgRes.rows[0].n
  } catch (err) {
    articles = null
  }
  res.status(200).json({
    message: 'EcheloNews News Organizer server',
    uptime: process.uptime(),
    platform: process.platform,
    databaseStatus: articles === null ? 'Unavailable' : 'Available',
    articles: articles,
  })
})

// Store an incoming article
app.post('/store', jsonParser, async (req, res) => {
  const errors = Validable.merge(
    Validable.whitelist(req.body, UPDATE_ALLOWED),
    Article.validateObject(req.body)
  )
  if (errors) {
    res.status(400).json(errors)
    return
  }

  // TODO: Check strict adding
  try {
    await new Article(req.body).save()
    res.status(201).send()
  } catch (err) {
    if (err.code === '23503') { // Inexistent foreign key
      const matcher = /.*\(([a-zA-Z0-9]+)\)=\((.+)\).*/
      const fkErr = err.detail.replace(matcher, '$1 $2').split(' ')
      res.status(403)
        .json({ [fkErr[0]]: `${fkErr[0]} '${fkErr[1]}' does not exist` })
    } else {
      console.error(err)
      res.status(500).json({ message: 'Internal database error. Sorry' })
    }
  }
})

// If this is the main module, launch the news organizer server
if (require.main === module) {
  const port = process.env.PORT || 8080
  console.log('[INFO] Setting up database')
  Article.db.setup(process.env.POSTGRES_URI)
  console.log(`[INFO] Launching server on port ${port}`)
  app.listen(port)
}

// Handle a database or validation error
function handleTransactionError(err, res) {
}


module.exports = app
