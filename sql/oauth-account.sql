-- echelonews - postgres table definitions
-- OAuth user account, with Google as a provider
CREATE TABLE OAuthAccount (
  id DECIMAL PRIMARY KEY,      -- User univocal ID, given by Google
  name VARCHAR NOT NULL,         -- User name, given by Google
  lang VARCHAR NOT NULL,         -- User native language
  countries VARCHAR[] NOT NULL,  -- Preferred countries
  topics VARCHAR[] NOT NULL,     -- Preferred topics
  created TIMESTAMP NOT NULL     -- User creation date and time
);
