CREATE TABLE shares (
  id TEXT PRIMARY KEY,
  tool TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TEXT NOT NULL,
  expires_at TEXT
);

CREATE INDEX idx_shares_tool ON shares(tool);
CREATE INDEX idx_shares_expires_at ON shares(expires_at);
