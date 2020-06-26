// echelonews - Factory for test units
// User model
'use strict'
require('dotenv').config({ path: '.env.test' })
const fs = require('fs')
const { User } = require('../../models/user')

class UserFactory {
  static async create(opt = {}) {
    try {
      return await User.create(Object.assign(this.uniqueParams(), opt))
    } catch (err) {
      throw err
    }
  }

  static uniqueUsernameCounter = 0
  static uniqueParams() {
    const id = this.uniqueUsernameCounter++
    return {
      id,
      name: `uniqueUser${id}`,
      email: `uniqueUser${id}@mo.ck`,
      pass: this.GOOD_PASSWORD,
      countries: [],
      topics: [],
    }
  }

  static bad = {
    id: -140,
    name: 'a',
    email: 'abc.de',
    pass: 'abc',
  }

  static GOOD_PASSWORD = '.6o0dp@ssv0rd!-'

  static async setupTestDB(opt) {
    try {
      // Mock users
      const existing = await this.create({
        name: 'idoalreadyexist',
        email: 'existing@ema.il',
      })
      const existing2 = await this.create({
        name: 'idoalreadyexist2',
        email: 'existing2@ema.il',
      })
      const nonExisting = await this.create({
        name: 'idonotexist',
        email: 'nonexisting@ema.il',
      })

      // Setup the database for user testing
      User.db.setup(opt)
      await User.db.pool
        .query(`DROP TABLE ${User.db.table} CASCADE`)
        .catch(() => {})
      await User.db.pool.query(fs.readFileSync('sql/account.sql').toString())

      await existing.save()
      await existing2.save()

      // Make sure that none of nonExisting ID columns will actually exist
      await nonExisting.save()
      await nonExisting.delete()

      return [existing, nonExisting, existing2]
    } catch (err) {
      console.log(err)
      throw err
    }
  }

  static async cleanupTestDB() {
    await User.db.cleanup()
  }
}

module.exports = { UserFactory }
