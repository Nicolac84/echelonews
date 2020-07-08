// echelonews - Test Unit
// News organizer API
"use strict";
require("dotenv").config({ path: ".env.test" });
const chai = require("chai");
const expect = chai.expect;
const app = require("../../services/news-organizer");
const { Article } = require("../../models/article");
const { ArticleFactory } = require("../factories/article");
const { NewspaperFactory } = require("../factories/newspaper");
chai.use(require("chai-http"));

describe("News Organizer API", function () {
  let npapers, conn;
  before(async () => {
    try {
      // Setup database
      await NewspaperFactory.setupTestDB(process.env.POSTGRES_URI);
      npapers = NewspaperFactory.entities;
      await ArticleFactory.setupTestDB(process.env.POSTGRES_URI);
      // Open a persistent connection with the organizer
      conn = chai.request(app).keepOpen();
    } catch (err) {
      console.error(err);
      throw err;
    }
  });
  after(async () => {
    await NewspaperFactory.cleanupTestDB();
    await ArticleFactory.cleanupTestDB();
    conn.close();
  });

  specify("GET / should return general information on the server", async () => {
    try {
      const res = await conn.get("/");
      expect(res).to.have.status(200);
      expect(res.body).to.have.ownProperty("message");
      expect(res.body).to.have.ownProperty("uptime");
    } catch (err) {
      throw err;
    }
  });

  describe("/store POST", function () {
    it("should be successful with consistent parameters", async () => {
      const art = ArticleFactory.create({ source: npapers.existing[0].id });
      try {
        expect(await Article.fetchMany({ title: art.title })).to.have.length(0);
        const res = await conn.post("/store").send(art);
        expect(res).to.have.status(201);
        expect(await Article.fetchMany({ title: art.title })).to.have.length(1);
      } catch (err) {
        throw err;
      }
    });

    describe("should return 400 when", function () {
      specify("inexistent field is passed", async () => {
        const art = ArticleFactory.create({ source: npapers.existing[0].id });
        art.abcde = 1234;
        try {
          const res = await conn.post("/store").send(art);
          expect(res).to.have.status(400);
          expect(res.body).to.have.ownProperty("abcde");
        } catch (err) {
          throw err;
        }
      });

      specify("id is passed", async () => {
        const art = ArticleFactory.create({
          source: npapers.existing[0].id,
          id: 12345,
        });
        try {
          const res = await conn.post("/store").send(art);
          expect(res).to.have.status(400);
        } catch (err) {
          throw err;
        }
      });

      for (const f of ["title", "source", "preview"]) {
        specify(`invalid ${f} is passed`, async () => {
          const art = ArticleFactory.create({
            source: npapers.existing[0].id,
            [f]: ArticleFactory.bad[f],
          });
          try {
            const res = await conn.post("/store").send(art);
            expect(res).to.have.status(400);
            expect(res.body).to.have.ownProperty(f);
          } catch (err) {
            throw err;
          }
        });

        specify(`${f} is missing`, async () => {
          const art = ArticleFactory.create({ source: npapers.existing[0].id });
          delete art[f];
          try {
            const res = await conn.post("/store").send(art);
            expect(res).to.have.status(400);
            expect(res.body).to.have.ownProperty(f);
          } catch (err) {
            throw err;
          }
        });
      }
    });
  });

  it("should return 403 if source newspaper does not exist", async () => {
    const art = ArticleFactory.create({ source: npapers.nonExisting[0].id });
    try {
      const res = await conn.post("/store").send(art);
      expect(res).to.have.status(403);
      expect(res.body).to.have.ownProperty("source");
    } catch (err) {
      throw err;
    }
  });
});
