// echelonews - Factory for test units
// Newspaper model
"use strict";
require("dotenv").config({ path: ".env.test" });
const { Newspaper } = require("../../models/newspaper");
const fs = require("fs");

class NewspaperFactory {
  static create(opt = {}) {
    return new Newspaper(Object.assign(this.uniqueParams(), opt));
  }

  static uniqueParams() {
    return {
      sourceType: "rss",
      country: "IT",
      info: {},
    };
  }

  static entities = { existing: [], nonExisting: [] };

  static bad = {
    sourceType: 12345678,
    country: ["USA", "URSS"],
    info: "abc",
  };

  static async setupTestDB(opt) {
    try {
      this.entities.existing = mocks.map((u) => NewspaperFactory.create(u));
      this.entities.nonExisting = [this.create()];

      // Setup the database for newspaper testing
      Newspaper.db.setup(opt);
      await Newspaper.db.pool
        .query(`DROP TABLE ${Newspaper.db.table} CASCADE`)
        .catch(() => {}); // Ignore errors, table could be inexistent
      await Newspaper.db.pool.query(
        fs.readFileSync("sql/newspaper.sql").toString()
      );

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
      throw err;
    }
  }

  static async cleanupTestDB() {
    Newspaper.db.cleanup();
  }
}

const mocks = [
  { sourceType: "rss", country: "IT", info: {} },
  { sourceType: "rss", country: "RU", info: {} },
  { sourceType: "rss", country: "US", info: {} },
  { sourceType: "rss", country: "CN", info: {} },
];

module.exports = { NewspaperFactory };
