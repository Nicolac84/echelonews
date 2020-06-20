// echelonews - Factory for test units
// Newspaper model
'use strict'
require('dotenv').config({ path: '.env.test' })
const { Newspaper } = require('../../models/newspaper')
const fs = require('fs')

class NewspaperFactory {
  static create(opt = {}) {
    return new Newspaper(Object.assign(this.uniqueParams(), opt))
  }

  static uniqueNewspaperCounter = 0
  static uniqueParams() {
    const id = this.uniqueNewspaperCounter++
    return {
      sourceType: 'rss',
      country: 'Italy',
      info: {},
    }
  }

  static bad = {
    sourceType: 12345678,
    country: ['USA', 'URSS'],
    info: 'abc',
  }

  static async setupTestDB(opt) {
    const existing = this.create(),
      existing2 = this.create(),
      nonExisting = this.create()
    try {
      // Setup the database for newspaper testing
      Newspaper.db.setup(opt)
      await Newspaper.db.pool
        .query(`DROP TABLE ${Newspaper.db.table} CASCADE`)
        .catch(console.error) // Ignore errors, table could be inexistent
      await Newspaper.db.pool.query(
        fs.readFileSync('sql/newspaper.sql').toString()
      )

      await existing.save()
      await existing2.save()

      // Make sure that none of nonExisting ID columns will actually exist
      await nonExisting.save()
      await nonExisting.delete()

      return [existing, nonExisting, existing2]
    } catch (err) {
      throw err
    }
  }

  static async cleanupTestDB() {
    Newspaper.db.cleanup()
  }
}

module.exports = { NewspaperFactory }
