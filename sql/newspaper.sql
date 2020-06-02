-- echelonews - postgres table definitions
-- Newspaper
CREATE TABLE Newspaper (
  id SERIAL PRIMARY KEY,        -- Newspaper univocal ID
  sourceType VARCHAR NOT NULL,  -- e.g.: RSS, Website etc...
  country VARCHAR NOT NULL,     -- Newspaper origin country
  info JSON NOT NULL            -- Additional metadata for the newspaper
);
