// echelonews - Test Unit
// Article model
"use strict";
require("dotenv").config({ path: ".env.test" });
const expect = require("chai").expect;
const { UserFactory } = require("../factories/user");
const { NewspaperFactory } = require("../factories/newspaper");
const { ArticleFactory } = require("../factories/article");
const { Article } = require("../../models/article");

describe("Article", function () {
  // Setup database
  let uid, npapers, articles;
  before(async () => {
    try {
      for (const f of [UserFactory, NewspaperFactory, ArticleFactory]) {
        await f.setupTestDB(process.env.POSTGRES_URI);
      }
      uid = {
        present: UserFactory.entities.existing[0].id,
        absent: UserFactory.entities.nonExisting[0].id,
      };
      npapers = NewspaperFactory.entities.existing;
      articles = ArticleFactory.entities.existing;
    } catch (err) {
      throw err;
    }
  });
  after(async () => {
    try {
      for (const f of [UserFactory, NewspaperFactory, ArticleFactory]) {
        await f.cleanupTestDB();
      }
    } catch (err) {
      throw err;
    }
  });

  describe("multiplexing", function () {
    it("should return a sorted array of articles with good parameters", async () => {
      try {
        const topic = articles[0].topics[0];
        const country = npapers.find((np) => np.id === articles[0].source)
          .country;
        const muxed = await Article.multiplex({
          uid: uid.present,
          topic,
          countries: [country],
        });
        expect(muxed).to.be.an("array");
        expect(muxed[0].constructor.name).to.equal("Article");
        expect(muxed.filter((e) => !e.topics.includes(topic))).to.be.empty;
        expect(
          muxed.filter((e) => {
            const thisCountry = npapers.find((np) => np.id === e.source)
              .country;
            return thisCountry !== country;
          })
        ).to.be.empty;
        // TODO: Sorted?
      } catch (err) {
        throw err;
      }
    });

    it("should return a sorted array of articles with inexistent user, with score === 0", async () => {
      try {
        const topic = articles[0].topics[0];
        const country = npapers.find((np) => np.id === articles[0].source)
          .country;
        const muxed = await Article.multiplex({
          uid: uid.absent,
          topic,
          countries: [country],
        });
        expect(muxed).to.be.an("array");
        expect(muxed[0].constructor.name).to.equal("Article");
        expect(muxed.filter((e) => !e.topics.includes(topic))).to.be.empty;
        expect(
          muxed.filter((e) => {
            const thisCountry = npapers.find((np) => np.id === e.source)
              .country;
            return thisCountry !== country;
          })
        ).to.be.empty;
        expect(muxed.filter((e) => e.score !== 0)).to.be.empty;
      } catch (err) {
        throw err;
      }
    });

    it("should return an empty array with inexistent topic", async () => {
      try {
        const country = npapers.find((np) => np.id === articles[0].source)
          .country;
        const muxed = await Article.multiplex({
          uid: uid.present,
          topic: "nonexisting",
          countries: [country],
        });
        expect(muxed).to.be.an("array");
        expect(muxed).to.be.empty;
      } catch (err) {
        throw err;
      }
    });

    it("should return an empty array with inexistent countries", async () => {
      try {
        const topic = articles[0].topics[0];
        const muxed = await Article.multiplex({
          uid: uid.absent,
          topic,
          countries: ["nonexisting"],
        });
        expect(muxed).to.be.an("array");
        expect(muxed).to.be.empty;
      } catch (err) {
        throw err;
      }
    });
  });
});
