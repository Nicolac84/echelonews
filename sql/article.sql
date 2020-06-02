-- echelonews - postgres table definitions
-- News article
CREATE TABLE Article (
  id SERIAL PRIMARY KEY,      -- Article univocal ID
  source INTEGER NOT NULL,    -- Source newspaper
  title VARCHAR NOT NULL,     -- Article title
  preview VARCHAR NOT NULL,   -- Article short description
  topics VARCHAR[] NOT NULL,  -- Treated topics
  origin VARCHAR NOT NULL,    -- Reference URL to the full article
  created TIMESTAMP NOT NULL, -- Creation date and time

  FOREIGN KEY (source) REFERENCES Newspaper(id)
);
