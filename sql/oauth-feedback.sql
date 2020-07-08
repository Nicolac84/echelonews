-- echelonews - postgres table definitions
-- User feedback for OAuth accounts
CREATE TABLE OAuthFeedback (
  id SERIAL PRIMARY KEY,     -- Feedback ID
  account DECIMAL NOT NULL,  -- Account which produced the feedback
  npaper INTEGER NOT NULL,   -- Newspaper
  score SMALLINT NOT NULL,   -- Feedback score

  FOREIGN KEY (account) REFERENCES OAuthAccount(id),
  FOREIGN KEY (npaper)  REFERENCES Newspaper(id)
)
