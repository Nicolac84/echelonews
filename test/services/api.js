// echelonews - Test Unit
// Main exposed API
"use strict";
require("dotenv").config({ path: ".env.test" });
const fs = require("fs");
const chai = require("chai");
const expect = chai.expect;
const { UserFactory } = require("../factories/user");
const { NewspaperFactory } = require("../factories/newspaper");
const { Feedback } = require("../../models/feedback");
const app = require("../../services/api.js");
const userHandlerApp = require("../../services/user-handler");
chai.use(require("chai-http"));

describe("Exposed API", function () {
  let user, absentUser, npaper, conn;
  before(async () => {
    // Setup the database
    try {
      await UserFactory.setupTestDB(process.env.POSTGRES_URI);
      await NewspaperFactory.setupTestDB(process.env.POSTGRES_URI);
      user = UserFactory.entities.existing[0];
      absentUser = UserFactory.entities.nonExisting[0];
      npaper = NewspaperFactory.entities.existing[0];
      await UserFactory.cleanupTestDB(); // We don't need the user db directly
      await NewspaperFactory.cleanupTestDB(); // Same thing for newspapers
      Feedback.db.setup(process.env.POSTGRES_URI);
    } catch (err) {
      throw err;
    }
    // Launch the user handler server
    userHandlerApp.launch({
      postgresUri: process.env.POSTGRES_URI,
      port: 8081, // TODO: Handle this better
    });
    // Perform the API setup
    app.setup({
      userHandlerUrl: "http://localhost:8081",
      jwtSecret: "none",
      postgresUri: process.env.POSTGRES_URI,
    });
    // Open a persistent connection before testing
    conn = chai.request(app).keepOpen();
  });
  after(async () => {
    conn.close();
  });

  describe("GET /", () => {});

  describe("POST /login", () => {
    it("should be successful with good credentials", async () => {
      try {
        const res = await conn.post("/login").send({
          name: user.name,
          pass: user.pass,
        });
        expect(res).to.have.status(200);
        expect(res.body).to.have.ownProperty("token");
        expect(res.body.token).to.be.a("string");
      } catch (err) {
        throw err;
      }
    });

    it("should return 400 with invalid credential properties", async () => {
      try {
        const res = await conn.post("/login").send({
          name: user.name,
          pass: user.pass,
          nonExistentField: "ciaone",
        });
        expect(res).to.have.status(400);
      } catch (err) {
        throw err;
      }
    });

    it("should return 401 with inexistent username", async () => {
      try {
        const res = await conn.post("/login").send({
          name: absentUser.name,
          pass: absentUser.pass,
        });
        expect(res).to.have.status(401);
      } catch (err) {
        throw err;
      }
    });

    it("should return 401 with incorrect password", async () => {
      try {
        const res = await conn.post("/login").send({
          name: user.name,
          pass: user.pass + "abc",
        });
        expect(res).to.have.status(401);
      } catch (err) {
        throw err;
      }
    });
  });

  describe("protected routes", function () {
    let token;
    before(async () => {
      try {
        const res = await conn.post("/login").send({
          name: user.name,
          pass: user.pass,
        });
        token = "Bearer " + res.body.token;
      } catch (err) {
        throw err;
      }
    });

    describe("GET /profile", function () {
      it("should return the user profile", async () => {
        try {
          const res = await conn.get("/profile").set("Authorization", token);
          expect(res).to.have.status(200);
          expect(res.body).to.be.an("object");
          expect(res.body).to.have.ownProperty("name");
          expect(res.body).to.have.ownProperty("email");
          expect(res.body).to.have.ownProperty("countries");
          expect(res.body).to.have.ownProperty("topics");
          expect(res.body).to.not.have.ownProperty("pass");
          expect(res.body).to.not.have.ownProperty("hash");
          expect(res.body).to.not.have.ownProperty("exists");
        } catch (err) {
          throw err;
        }
      });
    });

    describe("GET /countries", () => {
      it("should give an array of countries", async () => {
        try {
          const res = await conn.get("/countries").set("Authorization", token);
          expect(res).to.have.status(200);
          expect(res.body).to.be.an("array");
        } catch (err) {
          throw err;
        }
      });
    });

    describe("POST /countries", () => {
      it("should be successful with consistent countries", async () => {
        try {
          const res = await conn
            .post("/countries")
            .set("Authorization", token)
            .send(["IT", "RU", "US"]);
          expect(res).to.have.status(200);
        } catch (err) {
          throw err;
        }
      });

      it("should be successful with an empty array of countries", async () => {
        try {
          const res = await conn
            .post("/countries")
            .set("Authorization", token)
            .send([]);
          expect(res).to.have.status(200);
        } catch (err) {
          throw err;
        }
      });

      it("should return 400 with inconsistent countries", async () => {
        try {
          for (const body of [["US", 123, "CN"], "abc", null, { a: 1 }]) {
            const res = await conn
              .post("/countries")
              .set("Authorization", token)
              .send(body);
            expect(res).to.have.status(400);
          }
        } catch (err) {
          throw err;
        }
      });
    });

    describe("GET /topics", () => {
      it("should give an array of topics", async () => {
        try {
          const res = await conn.get("/topics").set("Authorization", token);
          expect(res).to.have.status(200);
          expect(res.body).to.be.an("array");
        } catch (err) {
          throw err;
        }
      });
    });

    describe("POST /topics", () => {
      it("should be successful with consistent topics", async () => {
        try {
          const res = await conn
            .post("/topics")
            .set("Authorization", token)
            .send(["politics", "sport"]);
          expect(res).to.have.status(200);
        } catch (err) {
          throw err;
        }
      });

      it("should be successful with an empty array of topics", async () => {
        try {
          const res = await conn
            .post("/topics")
            .set("Authorization", token)
            .send([]);
          expect(res).to.have.status(200);
        } catch (err) {
          throw err;
        }
      });

      it("should return 400 with inconsistent topics", async () => {
        try {
          for (const body of [["sport", 123, "ia"], "abc", null, { a: 1 }]) {
            const res = await conn
              .post("/topics")
              .set("Authorization", token)
              .send(body);
            expect(res).to.have.status(400);
          }
        } catch (err) {
          throw err;
        }
      });
    });

    describe("/feedback", function () {
      before(async () => {
        await Feedback.db.pool
          .query(fs.readFileSync("./sql/feedback.sql").toString())
          .catch(() => {});
      });

      describe("GET", () => {
        it("should return all the feedbacks registered by a user", async () => {
          try {
            const res = await conn.get("/feedback").set("Authorization", token);
            expect(res).to.have.status(200);
            expect(res.body).to.be.an("array");
          } catch (err) {
            throw err;
          }
        });
      });

      describe("PUT", () => {
        it("should create a new feedback if none is related to the newspaper", async () => {
          try {
            await Feedback.deleteMany({ account: user.id });
            const res = await conn
              .put("/feedback")
              .set("Authorization", token)
              .send({ npaper: npaper.id, score: -1 });
            expect(res).to.have.status(200);
            const fbs = await conn.get("/feedback").set("Authorization", token);
            expect(fbs.body[0].npaper).to.equal(npaper.id);
            expect(fbs.body[0].score).to.equal(-1);
          } catch (err) {
            throw err;
          }
        });

        it("should update a feedback if one related to the newspaper already exists", async () => {
          try {
            await Feedback.deleteMany({ account: user.id });
            const fb = new Feedback({
              account: user.id,
              npaper: npaper.id,
              score: 1,
            });
            await fb.save();
            const res = await conn
              .put("/feedback")
              .set("Authorization", token)
              .send({ npaper: npaper.id, score: 1 });
            expect(res).to.have.status(200);
            const fbs = await conn.get("/feedback").set("Authorization", token);
            expect(fbs.body[0].npaper).to.equal(npaper.id);
            expect(fbs.body[0].score).to.equal(2);
          } catch (err) {
            throw err;
          }
        });

        it("should return 400 with invalid properties", async () => {
          const res = await conn
            .put("/feedback")
            .set("Authorization", token)
            .send({ id: 123, npaper: npaper.id, score: 1 });
          expect(res).to.have.status(400);
        });

        it("should return 400 with malformed fields", async () => {
          const res = await conn
            .put("/feedback")
            .set("Authorization", token)
            .send({ npaper: npaper.id, score: "abc" });
          expect(res).to.have.status(400);
        });
      });

      describe("DELETE", () => {
        it("should delete all the feedbacks related to the user", async () => {
          try {
            const fb = new Feedback({
              account: user.id,
              npaper: npaper.id,
              score: 1,
            });
            await fb.save();
            const res = await conn
              .delete("/feedback")
              .set("Authorization", token);
            expect(res).to.have.status(200);
            const fbs = await conn.get("/feedback").set("Authorization", token);
            expect(fbs).to.have.status(200);
            expect(fbs.body).to.be.an("array");
            expect(fbs.body.length).to.equal(0);
          } catch (err) {
            throw err;
          }
        });
      });
    });

    describe.skip("GET /news", () => {});

    describe.skip("POST /news", () => {});
  });

  describe("when bearer JWT is missing", function () {
    [
      ["GET", "/news"],
      ["GET", "/feedback"],
      ["GET", "/countries"],
      ["GET", "/profile"],
      ["PUT", "/feedback"],
      ["POST", "/news"],
      ["POST", "/countries"],
      ["DELETE", "/feedback"],
    ].forEach(([method, path]) => {
      specify(`${method} ${path} should return 401`, async () => {
        try {
          const res = await conn[method.toLowerCase()](path);
          expect(res).to.have.status(401);
        } catch (err) {
          throw err;
        }
      });
    });
  });
});
