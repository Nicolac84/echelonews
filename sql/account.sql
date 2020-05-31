-- echelonews - postgres table definitions
-- User account
CREATE TABLE Account (
  id SERIAL PRIMARY KEY,         -- User univocal ID
  name VARCHAR UNIQUE NOT NULL,  -- Username
  email VARCHAR UNIQUE NOT NULL, -- User email
  hash VARCHAR NOT NULL,         -- Hashed password
  countries VARCHAR[] NOT NULL,  -- Preferred countries
  topics VARCHAR[] NOT NULL,     -- Preferred topics
  created TIMESTAMP NOT NULL     -- User creation date and time
);

-- User account Google relation
--CREATE TABLE AccountGoogle (
--  account INTEGER PRIMARY KEY,  -- User ID
--  gid INTEGER UNIQUE NOT NULL,  -- Google account ID
--
--  FOREIGN KEY (account) REFERENCES Account.id
--);
