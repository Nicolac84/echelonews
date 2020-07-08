// echelonews - Factory for test units
// User model
"use strict";
require("dotenv").config({ path: ".env.test" });
const fs = require("fs");
const { User } = require("../../models/user");

class UserFactory {
  static async create(opt = {}) {
    try {
      return await User.create(Object.assign(this.uniqueParams(), opt));
    } catch (err) {
      throw err;
    }
  }

  static uniqueUsernameCounter = 0;
  static uniqueParams() {
    const id = this.uniqueUsernameCounter++;
    return {
      id,
      name: `uniqueUser${id}`,
      email: `uniqueUser${id}@mo.ck`,
      pass: this.GOOD_PASSWORD,
      countries: [],
      topics: [],
    };
  }

  static entities = { existing: [], nonExisting: [] };

  static bad = {
    id: -140,
    name: "a",
    email: "abc.de",
    pass: "abc",
  };

  static GOOD_PASSWORD = ".6o0dp@ssv0rd!-";

  static async setupTestDB(opt) {
    try {
      // Mock users
      this.entities.existing = await Promise.all(
        mocks.map((u) => UserFactory.create(u))
      );
      this.entities.nonExisting = [
        await this.create({
          name: "idonotexist",
          email: "nonexisting@ema.il",
        }),
      ];

      // Setup the database for user testing
      User.db.setup(opt);
      await User.db.pool
        .query(`DROP TABLE ${User.db.table} CASCADE`)
        .catch(() => {});
      await User.db.pool.query(fs.readFileSync("sql/account.sql").toString());

      await User.db.pool.query(`DROP TABLE Feedback CASCADE`).catch(() => {});
      await User.db.pool.query(fs.readFileSync("sql/feedback.sql").toString());

      // Save the existing entities, save and delete the non-existing ones
      for (const e of this.entities.existing) await e.save();
      for (const e of this.entities.nonExisting) {
        await e.save();
        await e.delete();
      }

      return {
        present: this.entities.present,
        absent: this.entities.absent,
      };
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  static async cleanupTestDB() {
    await User.db.cleanup();
  }
}

const mocks = [
  {
    name: "existingUser1",
    email: "user1@ema.il",
    countries: ["IT"],
    topics: ["Politics"],
  },
  {
    name: "existingUser2",
    email: "user2@ema.il",
    countries: ["RU"],
    topics: ["Politics", "Sport"],
  },
  {
    name: "existingUser3",
    email: "user3@ema.il",
    countries: ["US"],
    topics: ["Sport"],
  },
];

module.exports = { UserFactory };
