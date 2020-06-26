-- echelonews - postgres table definitions
-- User feedback
CREATE TABLE Feedback (
  id SERIAL PRIMARY KEY,     -- Feedback ID
  account INTEGER NOT NULL,  -- Account which produced the feedback
  npaper INTEGER NOT NULL,   -- Newspaper
  score SMALLINT NOT NULL,   -- Feedback score

  FOREIGN KEY (account) REFERENCES Account(id),
  FOREIGN KEY (npaper)  REFERENCES Newspaper(id)
)
