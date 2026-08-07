CREATE SCHEMA IF NOT EXISTS rmr;

CREATE TABLE IF NOT EXISTS rmr.synthetic_seed_marker (
  fixture_key text PRIMARY KEY,
  description text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT synthetic_seed_marker_fixture_key_format
    CHECK (fixture_key ~ '^synthetic\.[a-z0-9._-]+$')
);

COMMENT ON TABLE rmr.synthetic_seed_marker IS
  'Synthetic local/CI fixture marker only; no person, representative, identity, or civic data.';
