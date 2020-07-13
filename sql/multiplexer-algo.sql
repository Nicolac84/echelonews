-- echelonews - postgres SQL multiplexer algorithm
-- Newspaper
CREATE OR REPLACE FUNCTION multiplex(
  _user INTEGER, _topic VARCHAR, _country VARCHAR
)
RETURNS TABLE (
  id INTEGER, title VARCHAR, preview VARCHAR, topics VARCHAR[], source INTEGER,
  origin VARCHAR, created TIMESTAMP, score SMALLINT
)
AS $$
BEGIN
  -- Perform news multiplexing for a single topic and country
  RETURN QUERY SELECT art.id, art.title, art.preview, art.topics, art.source,
    art.origin, art.created, COALESCE(f.score, 0::SMALLINT) AS score
  FROM Newspaper np, Article art LEFT JOIN Feedback f ON
    f.npaper = art.source AND _user = COALESCE(f.account, _user)
  WHERE art.source = np.id AND
        _country = np.country AND
        _topic = ANY(art.topics)
  ORDER BY f.score DESC
  LIMIT 10
  ;
END
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION multiplex_oauth(
  _user INTEGER, _topic VARCHAR, _country VARCHAR
)
RETURNS TABLE (
  id INTEGER, title VARCHAR, preview VARCHAR, topics VARCHAR[], source INTEGER,
  origin VARCHAR, created TIMESTAMP, score SMALLINT
)
AS $$
BEGIN
  -- Perform news multiplexing for a single topic and country
  RETURN QUERY SELECT art.id, art.title, art.preview, art.topics, art.source,
    art.origin, art.created, COALESCE(f.score, 0::SMALLINT) AS score
  FROM Newspaper np, Article art LEFT JOIN OAuthFeedback f ON
    f.npaper = art.source AND _user = COALESCE(f.account, _user)
  WHERE art.source = np.id AND
        _country = np.country AND
        _topic = ANY(art.topics)
  ORDER BY f.score DESC
  LIMIT 10
  ;
END
$$ LANGUAGE plpgsql;
