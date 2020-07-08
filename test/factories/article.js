// echelonews - Factory for test units
// Article model
"use strict";
require("dotenv").config({ path: ".env.test" });
const fs = require("fs");
const { Article, VolatileArticle } = require("../../models/article");
const { NewspaperFactory } = require("./newspaper");

class ArticleFactory {
  static create(opt = {}) {
    return new VolatileArticle(Object.assign(this.uniqueParams(), opt));
  }

  static createPersistent(opt = {}) {
    return new Article(Object.assign(this.uniqueParams(), opt));
  }

  static uniqueArticleCounter = 0;
  static uniqueParams() {
    const id = this.uniqueArticleCounter++;
    return {
      title: `Article ${id}`,
      preview: `Preview of article ${id}`,
      origin: "localhost/some-rss.xml",
      topics: ["some-topic"],
    };
  }

  static entities = { existing: [], nonExisting: [] };

  static bad = {
    id: -123,
    title: "",
    preview: "",
  };

  static async setupTestDB(opt) {
    const npapers = NewspaperFactory.entities.existing;
    if (!npapers || !npapers.length)
      throw new Error(
        "ArticleFactory: NewspaperFactory must be initialized first"
      );

    try {
      this.entities.existing = mocks.map((u) =>
        ArticleFactory.createPersistent(u)
      );
      this.entities.nonExisting = [
        this.createPersistent({ source: npapers[0].id }),
      ];

      // Setup the database for article testing
      Article.db.setup(opt);
      await Article.db.pool
        .query(`DROP TABLE ${Article.db.table} CASCADE`)
        .catch(() => {});
      await Article.db.pool
        .query(fs.readFileSync("sql/article.sql").toString())
        .catch((err) => {
          if (err.code != "42P07") throw err;
        });

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
    Article.db.cleanup();
  }
}

const mocks = [
  {
    source: 1,
    title: "Article 1 from Italy",
    preview: "Preview 1",
    topics: ["Politics"],
    origin: "some-origin-url",
  },
  {
    source: 2,
    title: "Article 2 from Russia",
    preview: "Preview 2",
    topics: ["Sport"],
    origin: "some-origin-url",
  },
  {
    source: 3,
    title: "Article 3 from USA",
    preview: "Preview 3",
    topics: ["Politics"],
    origin: "some-origin-url",
  },
  {
    source: 4,
    title: "Article 4 from China",
    preview: "Preview 4",
    topics: ["Politics"],
    origin: "some-origin-url",
  },
  {
    source: 1,
    title: "Article 5 from Italy",
    preview: "Preview 5",
    topics: ["Politics", "Sport"],
    origin: "some-origin-url",
  },
  {
    source: 2,
    title: "Article 6 from Russia",
    preview: "Preview 6",
    topics: ["Sport"],
    origin: "some-origin-url",
  },
];

module.exports = { ArticleFactory };
