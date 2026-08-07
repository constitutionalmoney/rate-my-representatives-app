INSERT INTO rmr.synthetic_seed_marker (fixture_key, description)
VALUES (
  'synthetic.infrastructure.foundation.v1',
  'Clearly synthetic local and CI infrastructure readiness fixture.'
)
ON CONFLICT (fixture_key) DO UPDATE
SET description = EXCLUDED.description;
