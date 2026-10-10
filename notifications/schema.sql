CREATE TABLE IF NOT EXISTS alerts (
 endpoint TEXT NOT NULL,
 subscription TEXT NOT NULL,
 anime_id INTEGER NOT NULL,
 title TEXT NOT NULL,
 episode INTEGER NOT NULL,
 airing_at INTEGER NOT NULL,
 url TEXT NOT NULL,
 created_at INTEGER NOT NULL,
 PRIMARY KEY(endpoint, anime_id)
);
CREATE INDEX IF NOT EXISTS idx_alerts_due ON alerts(airing_at);
