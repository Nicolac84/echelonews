// echelonews - Factory for test units
// User model
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
}

module.exports = { UserFactory }
