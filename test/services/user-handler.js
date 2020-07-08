// echelonews - Test Unit
// User handler API
"use strict";
require("dotenv").config({ path: ".env.test" });
const chai = require("chai");
const expect = chai.expect;
const app = require("../../services/user-handler");
const { User } = require("../../models/user");
const { UserFactory } = require("../factories/user");
chai.use(require("chai-http"));

describe("User Handler API", function () {
  // Initialize test database with mock users
  let presentUser, presentUser2, absentUser, invalidUser;
  before(async () => {
    invalidUser = new User({
      id: -123,
      name: "abc123!!#",
      email: "abc.de",
      pass: "a",
      countries: "abc",
      topics: "def",
    });
    try {
      await UserFactory.setupTestDB(process.env.POSTGRES_URI);
      presentUser = UserFactory.entities.existing[0];
      presentUser2 = UserFactory.entities.existing[1];
      absentUser = UserFactory.entities.nonExisting[0];
    } catch (err) {
      console.error(err);
      process.exit(1);
    }
  });
  after(async () => await UserFactory.cleanupTestDB());

  // Open a persistent connection before testing
  let conn;
  before(() => (conn = chai.request(app).keepOpen()));
  after(() => conn.close());

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

  describe("/users", function () {
    for (const id of ["id", "name", "email"]) {
      describe(`/by${id}/{${id}}`, function () {
        describe("GET", function () {
          it(`should be successful with good ${id}`, async () => {
            try {
              const res = await conn.get(
                `/users/by${id}/${encodeURIComponent(presentUser[id])}`
              );
              expect(res).to.have.status(200);
              expect(User.validateObject(res.body)).to.equal(undefined);
              expect(res.body).to.not.have.ownProperty("pass");
              expect(res.body).to.not.have.ownProperty("hash");
              expect(res.body).to.not.have.ownProperty("exists");
            } catch (err) {
              throw err;
            }
          });

          it(`should return 404 with inexistent ${id}`, async () => {
            try {
              const res = await conn.get(
                `/users/by${id}/${encodeURIComponent(absentUser[id])}`
              );
              expect(res).to.have.status(404);
            } catch (err) {
              throw err;
            }
          });

          it(`should return 400 with invalid ${id}`, async () => {
            try {
              const res = await conn.get(
                `/users/by${id}/${encodeURIComponent(invalidUser[id])}`
              );
              expect(res).to.have.status(400);
            } catch (err) {
              throw err;
            }
          });
        });

        describe("PUT", function () {
          function performUpdateRequest(idval, body) {
            return conn
              .put(`/users/by${id}/${encodeURIComponent(idval)}`)
              .send(body);
          }

          it("should be successful and consistent parameters", async () => {
            try {
              const res = await performUpdateRequest(presentUser[id], {
                countries: ["IT", "US", "RU", "CN"],
              });
              expect(res).to.have.status(200);
              // TODO: Test if presentUser changed?
            } catch (err) {
              throw err;
            }
          });

          it("should properly update password", async () => {
            function restorePass() {
              return performUpdateRequest(presentUser[id], {
                pass: presentUser2.pass,
              });
            }
            try {
              const res = await performUpdateRequest(presentUser[id], {
                pass: "abcdefghi123%^$",
              });
              expect(res).to.have.status(200);
              const res2 = await conn.post("/auth").send({
                name: presentUser.name,
                pass: "abcdefghi123%^$",
              });
              expect(res2).to.have.status(200);
              await restorePass();
            } catch (err) {
              await restorePass();
              throw err;
            }
          });

          it(`should return 404 with inexistent ${id}`, async () => {
            try {
              const res = await performUpdateRequest(absentUser[id], {
                countries: ["IT"],
              });
              expect(res).to.have.status(404);
            } catch (err) {
              throw err;
            }
          });

          for (const f of ["id", "created", "hash"]) {
            it(`should return 400 when trying to update ${f}`, async () => {
              try {
                const res = await performUpdateRequest(presentUser[id], {
                  [f]: presentUser[f],
                });
                expect(res).to.have.status(400);
              } catch (err) {
                throw err;
              }
            });
          }

          it("should return 403 when a unique field is already taken", async () => {
            try {
              const res = await performUpdateRequest(presentUser[id], {
                name: presentUser2.name,
              });
              expect(res).to.have.status(403);
            } catch (err) {
              throw err;
            }
          });

          it("should return 400 with invalid update fields", async () => {
            try {
              const res = await performUpdateRequest(presentUser[id], {
                invalidField: "abc",
              });
              expect(res).to.have.status(400);
            } catch (err) {
              throw err;
            }
          });

          it("should return 400 with invalid update values", async () => {
            try {
              const res = await performUpdateRequest(presentUser[id], {
                name: "123@!",
              });
              expect(res).to.have.status(400);
            } catch (err) {
              throw err;
            }
          });
        });

        describe("DELETE", function () {
          it(`should be successful with good ${id}`, async () => {
            try {
              // Use another user instead of 'presentUser'
              const user = await UserFactory.create();
              await user.save();
              const res = await conn.delete(
                `/users/by${id}/${encodeURIComponent(user[id])}`
              );
              expect(res).to.have.status(200);
              expect(await User.fetch("id", user.id)).to.equal(null);
            } catch (err) {
              throw err;
            }
          });

          it(`should return 404 with inexistent ${id}`, async () => {
            try {
              const res = await conn.delete(
                `/users/by${id}/${encodeURIComponent(absentUser[id])}`
              );
              expect(res).to.have.status(404);
            } catch (err) {
              throw err;
            }
          });

          it(`should return 400 with invalid ${id}`, async () => {
            try {
              const res = await conn.delete(
                `/users/by${id}/${encodeURIComponent(invalidUser[id])}`
              );
              expect(res).to.have.status(400);
            } catch (err) {
              throw err;
            }
          });
        });
      });
    }
  });

  describe("/auth", function () {
    it("should be successful with good credentials", async () => {
      try {
        const res = await conn
          .post("/auth")
          .send({ name: presentUser.name, pass: presentUser.pass });
        expect(res).to.have.status(200);
        expect(res.body.name).to.equal(presentUser.name);
      } catch (err) {
        throw err;
      }
    });

    it("should return 404 on inexistent user", async () => {
      try {
        const res = await conn
          .post("/auth")
          .send({ name: absentUser.name, pass: absentUser.pass });
        expect(res).to.have.status(404);
      } catch (err) {
        throw err;
      }
    });

    it("should return 404 on bad password", async () => {
      try {
        const res = await conn
          .post("/auth")
          .send({ name: absentUser.name, pass: "abcdefghi1!A" });
        expect(res).to.have.status(404);
      } catch (err) {
        throw err;
      }
    });

    it("should return 400 with invalid name", async () => {
      try {
        const res = await conn
          .post("/auth")
          .send({ name: invalidUser.name, pass: "abcdefghi1!A" });
        expect(res).to.have.status(400);
      } catch (err) {
        throw err;
      }
    });

    it("should return 400 with missing name", async () => {
      try {
        const res = await conn.post("/auth").send({ pass: "abcdefghi1!A" });
        expect(res).to.have.status(400);
      } catch (err) {
        throw err;
      }
    });

    it("should return 400 with invalid password", async () => {
      try {
        const res = await conn
          .post("/auth")
          .send({ name: presentUser.name, pass: invalidUser.pass });
        expect(res).to.have.status(400);
      } catch (err) {
        throw err;
      }
    });

    it("should return 400 with missing password", async () => {
      try {
        const res = await conn.post("/auth").send({ name: presentUser.name });
        expect(res).to.have.status(400);
      } catch (err) {
        throw err;
      }
    });
  });

  describe("/register POST", function () {
    let user;
    beforeEach(async () => (user = await UserFactory.create()));

    function tryRegister(props) {
      return conn
        .post("/register")
        .send(
          Object.assign(
            { name: user.name, email: user.email, pass: user.pass },
            props || {}
          )
        );
    }

    it("should be successful with valid user data", async () => {
      try {
        const res = await tryRegister();
        expect(res).to.have.status(201);
        expect(res.body).to.have.ownProperty("name");
        expect(res.body).to.not.have.ownProperty("pass");
        expect(res.body).to.not.have.ownProperty("hash");
        expect(res.body.name).to.equal(user.name);
      } catch (err) {
        throw err;
      }
    });

    describe("should return 400", function () {
      for (const f of ["name", "email", "pass"]) {
        specify(`with invalid ${f}`, async () => {
          try {
            const res = await tryRegister({ [f]: invalidUser[f] });
            expect(res).to.have.status(400);
          } catch (err) {
            throw err;
          }
        });
      }

      for (const f of ["id", "hash", "created"]) {
        specify(`when attempting to pass (valid) ${f}`, async () => {
          try {
            const res = await tryRegister({ [f]: presentUser[f] });
            expect(res).to.have.status(400);
          } catch (err) {
            throw err;
          }
        });
      }
    });

    it("should return 404 if if a unique field is already taken", async () => {
      try {
        const res = await tryRegister({
          name: presentUser.name,
          pass: presentUser.pass,
        });
        expect(res).to.have.status(403);
      } catch (err) {
        throw err;
      }
    });
  });
});
