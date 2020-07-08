// echelonews - Test Unit
// User model
"use strict";
require("dotenv").config({ path: ".env.test" });
const expect = require("chai").expect;
const { User } = require("../../models/user");
const { UserFactory } = require("../factories/user");

const commonTestCases = [
  ["is an object", { a: "b" }],
  ["is a function", () => "func"],
  ["is undefined", undefined],
  ["is null", null],
  ["is blank", ""],
];

describe("User", function () {
  // Setup database for testing
  let existing;
  let nonExisting;
  before(async () => {
    try {
      await UserFactory.setupTestDB(process.env.POSTGRES_URI);
      existing = UserFactory.entities.existing[0];
      nonExisting = UserFactory.entities.nonExisting[0];
    } catch (err) {
      console.error(err);
      process.exit(1);
    }
  });
  after(async () => await UserFactory.cleanupTestDB());

  it("should be created with consistent parameters", function (done) {
    UserFactory.create()
      .then(() => done())
      .catch((err) => done(err));
  });

  describe("should not be valid", function () {
    let user;
    beforeEach(async () => (user = await UserFactory.create()));

    describe("when username", function () {
      commonTestCases
        .concat([
          [
            "is too short",
            "a".repeat(User.constraints.name.length.minimum - 1),
          ],
          ["is too long", "a".repeat(User.constraints.name.length.maximum + 1)],
          [
            "contains symbols",
            "a=c!".repeat(User.constraints.name.length.maximum / 4),
          ],
        ])
        .forEach(function ([testCase, name]) {
          specify(testCase, () => {
            user.name = name;
            expect(user.validate()).to.have.property("name");
          });
        });
    });

    describe("when email", function () {
      commonTestCases
        .concat([
          ["is abc", "abc"],
          ["is abc@de", "abc@de"],
          ["is abc@de@fg.h", "abc@de@fg.h"],
        ])
        .forEach(function ([testCase, email]) {
          specify(testCase, () => {
            user.email = email;
            expect(user.validate()).to.have.property("email");
          });
        });
    });

    describe("when countries", function () {
      specify("are not an array", () => {
        for (const cs of [{}, "ciao", new Set([1, 2, 3])]) {
          user.countries = cs;
          expect(user.validate()).to.have.property("countries");
        }
      });

      specify("some element is not a string", () => {
        user.countries = ["IT", 123, "RU"];
        expect(user.validate()).to.have.property("countries");
      });

      specify("some element is blank", () => {
        user.countries = ["IT", "", "RU"];
        expect(user.validate()).to.have.property("countries");
      });
    });

    describe("when topics", function () {
      specify("are not an array", () => {
        for (const ts of [{}, "ciao", new Set([1, 2, 3])]) {
          user.topics = ts;
          expect(user.validate()).to.have.property("topics");
        }
      });

      specify("some element is not a string", () => {
        user.topics = ["politics", 123, "sport"];
        expect(user.validate()).to.have.property("topics");
      });

      specify("some element is blank", () => {
        user.topics = ["politics", "", "sport"];
        expect(user.validate()).to.have.property("topics");
      });
    });
  });

  describe("password", function () {
    it("should be set if valid", function (done) {
      UserFactory.create()
        .then((user) => user.setPassword(UserFactory.GOOD_PASSWORD.shuffle()))
        .then(() => done())
        .catch(() => done(new Error("Password should be set")));
    });

    describe("should not be set when", function () {
      commonTestCases
        .concat([
          [
            "is too short",
            "a!B1".repeat(User.constraints.pass.length.minimum / 4 - 1),
          ],
          ["is too long", "a!B1".repeat(User.constraints.pass.length.maximum)],
        ])
        .forEach(([testCase, pass]) => {
          specify(testCase, (done) => {
            UserFactory.create()
              .then((user) => user.setPassword(pass))
              .then(() => done(new Error("Password should not be set")))
              .catch(() => done());
          });
        });
    });
  });

  it("should be authenticated with a good password", (done) => {
    UserFactory.create()
      .then((user) => user.authenticate(UserFactory.GOOD_PASSWORD))
      .then((result) => {
        if (result) done();
        else done(new Error("User should be authenticated"));
      })
      .catch((err) => done(err));
  });

  it("should not be authenticated with a bad password", (done) => {
    UserFactory.create()
      .then((user) => user.authenticate(UserFactory.GOOD_PASSWORD.shuffle()))
      .then((result) => {
        if (result) done(new Error("User should not be authenticated"));
        else done();
      })
      .catch((err) => done(err));
  });

  describe("fetching", function () {
    describe("should be successful with existing", function () {
      for (const field of User.db.ids()) {
        specify(field, (done) => {
          User.fetch(field, existing[field])
            .then((user) => {
              if (user[field] === existing[field]) done();
              else done(new Error(`Unexpected ${field}: ${user[field]}`));
            })
            .catch((err) => done(err));
        });
      }
    });

    describe("should not be fetched with non-existing", function () {
      for (const field of User.db.ids()) {
        specify(field, (done) => {
          User.fetch(field, nonExisting[field])
            .then((user) => {
              if (user) {
                done(new Error(`Fetched user with ${field} ${user[field]}`));
              } else done();
            })
            .catch((err) => done(err));
        });
      }
    });

    describe("should throw an error", function () {
      describe("when field is", function () {
        commonTestCases
          .concat(["pass", "exists", "hash"].map((f) => [f, f]))
          .forEach(([desc, field]) => {
            specify(desc, (done) => {
              User.fetch(field, "abcdefghijk")
                .then(() =>
                  done(new Error("Fetching user should have thrown an error"))
                )
                .catch(() => done());
            });
          });
      });

      for (const field of User.db.ids()) {
        specify(`with invalid ${field}`, (done) => {
          User.fetch(field, UserFactory.bad[field])
            .then(() =>
              done(new Error("Fetching user should have thrown an error"))
            )
            .catch(() => done());
        });
      }
    });
  });

  describe("saving", function () {
    it("should be successful with a good user", function (done) {
      UserFactory.create()
        .then(() => done())
        .catch((err) => done(err));
    });

    it("should throw an error if the user exists", function (done) {
      UserFactory.create({ name: existing.name })
        .then((user) => user.save())
        .then(() =>
          done(new Error("Duplicated user should not have been saved"))
        )
        .catch(() => done()); // TODO: Assert error type
    });
  });

  describe("updating", function () {
    let user;
    beforeEach(async () => {
      user = await UserFactory.create();
      await user.save();
    });

    describe("should be successful when", function () {
      specify("all fields are updated", async () => {
        const new_email = user.email.concat("doh");
        user.email = new_email;
        try {
          await user.update();
          const user2 = await User.fetch("name", user.name);
          expect(user2.name).to.equal(user.name);
          expect(user2.email).to.equal(new_email);
        } catch (err) {
          throw err;
        }
      });

      for (const field of ["email", "hash"]) {
        specify(`just ${field} is updated`, async () => {
          try {
            const other = await UserFactory.create();
            user[field] = other[field];
            await user.update(field);
            const user2 = await User.fetch("name", user.name);
            expect(user2[field]).to.equal(other[field]);
          } catch (err) {
            throw err;
          }
        });
      }
    });

    describe("should throw an error", function () {
      specify("with invalid fields", (done) => {
        user
          .update(["name", "idonotexist", "email"])
          .then(() => done(new Error("Updated non-existent field for a user")))
          .catch(() => done());
      });

      for (const field of User.db.ids()) {
        specify(`with invalid ${field}`, (done) => {
          if (field === "id") {
            done(); // ID won't be updated
            return;
          }
          user[field] = UserFactory.bad[field];
          user
            .update(field)
            .then(() => done(new Error(`Updated user with malformed ${field}`)))
            .catch(() => done());
        });
      }
    });
  });

  describe("should be removable", function () {
    let user;
    beforeEach(async () => {
      user = await UserFactory.create();
      await user.save();
    });

    for (const field of User.db.ids()) {
      specify(`by ${field}`, async () => {
        try {
          const result = await User.delete(field, user[field]);
          if (!result) throw new Error("Existent user was not removed");
        } catch (err) {
          throw err;
        }
      });
    }

    specify("by instance", async () => {
      try {
        const result = await user.delete();
        if (!result) throw new Error("Existent user was not removed");
      } catch (err) {
        throw err;
      }
    });
  });

  it("should not be removed if non-existent", async () => {
    let result;
    try {
      const user = await UserFactory.create();

      result = await user.delete();
      if (result) throw new Error("Explicitly non-existent user was removed");

      user.exists = true;
      result = await user.delete();
      if (result) throw new Error("Implicitly non-existent user was removed");
    } catch (err) {
      throw err;
    }
  });

  it("should return a custom string representation with toString()", () => {
    const str = existing.toString();
    expect(str.includes(`${existing.id}`)).to.be.true;
    expect(str.includes(existing.name)).to.be.true;
    expect(str.includes(existing.email)).to.be.true;
  });

  it("should return a sharing-safe representation with export()", () => {
    const obj = existing.export();
    for (const p of ["id", "name", "email", "countries", "topics"]) {
      expect(obj).to.have.ownProperty(p);
    }
    for (const p of ["pass", "hash"]) {
      expect(obj).to.not.have.ownProperty(p);
    }
  });
});

// Pseudo-randomly shuffle a string
String.prototype.shuffle = function () {
  return this.split("")
    .sort(() => 0.5 - Math.random())
    .join("");
};
