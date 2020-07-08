// echelonews - Test Unit
// News fetcher
"use strict";
require("dotenv").config({ path: ".env.test" });
const fs = require("fs");
const nock = require("nock");
const chai = require("chai");
const sinon = require("sinon");
const Fetcher = require("../../services/news-fetcher").RssFetcher;
const { ArticleFactory } = require("../factories/article");
const { NewspaperFactory } = require("../factories/newspaper");
const { Newspaper } = require("../../models/newspaper");

const expect = chai.expect;
chai.use(require("chai-http"));

const nasaRss = fs
  .readFileSync("./test/assets/nasa-breaking-news.rss")
  .toString();
const absNasaUrl = "http://www.nasa.gov";
const relNasaUrl = "/rss/dyn/breaking_news.rss";

describe("RSS News Fetcher", () => {
  // Setup
  let nasa, articles;
  before(async () => {
    nasa = newNasa();
    try {
      await NewspaperFactory.setupTestDB(process.env.POSTGRES_URI);
      await ArticleFactory.setupTestDB(process.env.POSTGRES_URI);
      articles = ArticleFactory.entities.existing;
    } catch (err) {
      console.error(err);
      throw err;
    }
  });
  after(async () => {
    // await Fetcher.cleanup()
    await NewspaperFactory.cleanupTestDB();
    await ArticleFactory.cleanupTestDB();
  });

  describe("static method .download()", () => {
    it("should return an XML string if the RSS feed has been modified", async () => {
      nock(absNasaUrl).get(relNasaUrl).reply(200, nasaRss);
      try {
        const rss = await Fetcher.download(nasa);
        expect(rss).to.equal(nasaRss);
      } catch (err) {
        throw err;
      }
    });

    it("should return null if the RSS feed has not been modified", async () => {
      nock(absNasaUrl).get(relNasaUrl).reply(304);
      try {
        const rss = await Fetcher.download(nasa);
        expect(rss).to.equal(null);
      } catch (err) {
        throw err;
      }
    });

    it("should fail with an unreachable source", (done) => {
      nock(absNasaUrl).get(relNasaUrl).reply(404);
      Fetcher.download(nasa)
        .then(() => done(new Error("Request was successful")))
        .catch(() => done());
    });

    it("should fail with an invalid source", (done) => {
      Fetcher.download({ a: 1, b: 2 })
        .then(() => done(new Error("Request was successful")))
        .catch(() => done());
    });
  });

  // TODO: Add failure test cases
  describe("static method .process()", () => {
    it("should return new articles if RSS feed is an XML string", async () => {
      try {
        const news = await Fetcher.process(nasa, nasaRss);
        expect(news).to.be.an("array");
        expect(news).to.not.be.empty;
        expect(news[0]).to.have.ownProperty("source");
        expect(news[0]).to.have.ownProperty("title");
        expect(news[0]).to.have.ownProperty("preview");
        expect(news[0]).to.have.ownProperty("origin");
        expect(news[0]).to.have.ownProperty("created");
        expect(news[0]).to.have.ownProperty("topics");
        expect(news[0].topics).to.be.an("array");
      } catch (err) {
        throw err;
      }
    });

    it("should return null if RSS feed is null", async () => {
      try {
        const news = await Fetcher.process(nasa, null);
        expect(news).to.equal(null);
      } catch (err) {
        throw err;
      }
    });
  });

  describe(".setup()", () => {
    let fetcher;
    beforeEach(() => (fetcher = new Fetcher()));
    afterEach(async () => {
      sinon.restore();
      await Fetcher.cleanup();
    });

    it("should initialize the fetcher when successful", async () => {
      try {
        await fetcher.setup();
        expect(fetcher.npapers).to.be.an("array");
        expect(fetcher.npapers).to.not.be.empty;
        expect(fetcher.npapers[0].constructor.name).to.equal("Newspaper");
      } catch (err) {
        throw err;
      }
    });

    it("should fail when the database is unavailable", (done) => {
      const fake = sinon.fake.rejects(new Error("Rejecting fake"));
      sinon.replace(Newspaper, "fetchMany", fake);
      fetcher
        .setup()
        .then((ret) =>
          done(new Error(`.setup() resolved with ${JSON.stringify(ret)}`))
        )
        .catch(() => done());
    });
  });

  describe(".store()", () => {
    let fetcher;
    const organizerUrl = "http://localhost:1234";
    beforeEach(() => (fetcher = new Fetcher({ organizerUrl })));

    it("should be successful with a valid array of articles", async () => {
      nock(organizerUrl).post("/store").reply(201).persist();
      try {
        const n = await fetcher.store(articles);
        expect(n).to.equal(articles.length);
        nock.restore();
      } catch (err) {
        nock.restore();
        throw err;
      }
    });

    describe("should return null", () => {
      specify("with an empty array", async () => {
        try {
          const n = await fetcher.store([]);
          expect(n).to.equal(0);
        } catch (err) {
          throw err;
        }
      });

      specify("with a falsy value", async () => {
        try {
          const n = await fetcher.store(null);
          expect(n).to.equal(0);
        } catch (err) {
          throw err;
        }
      });
    });
  });

  describe.skip(".task()");
  describe.skip(".run()");
});

function newNasa() {
  return NewspaperFactory.create({
    sourceType: "rss",
    country: "US",
    info: {
      lastFetched: new Date(1),
      origin: "http://www.nasa.gov/rss/dyn/breaking_news.rss",
    },
  });
}
