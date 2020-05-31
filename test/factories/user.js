// echelonews - Factory for test units
// User model
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
      const existing = await this.create({ name: 'idoalreadyexist' })
      const nonExisting = await this.create({ name: 'idonotexist' })

      // Setup the database for user testing
      User.db.setup(opt)
      await User.db.pool
        .query(`DROP TABLE ${User.db.table}`)
        .catch(() => {})
        .catch(() => {}) // Ignore errors, table could be inexistent
      await User.db.pool.query(fs.readFileSync('sql/account.sql').toString())

      await existing.save()

      // Make sure that none of nonExisting ID columns will actually exist
      await nonExisting.save()
      await nonExisting.delete()

      return [existing, nonExisting]
    } catch (err) {
      throw err
    }
  }

  static async cleanupTestDB() {
    User.db.cleanup()
  }
}

module.exports = { UserFactory }
