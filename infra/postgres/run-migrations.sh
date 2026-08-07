#!/bin/sh
set -eu

export PGPASSWORD="$(cat "${POSTGRES_PASSWORD_FILE}")"

psql --set ON_ERROR_STOP=1 <<'SQL'
CREATE SCHEMA IF NOT EXISTS rmr_internal;
CREATE TABLE IF NOT EXISTS rmr_internal.schema_migration (
  version text PRIMARY KEY,
  sha256 text NOT NULL CHECK (sha256 ~ '^[a-f0-9]{64}$'),
  applied_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
);
SQL

for migration in /opt/rmr/migrations/*.sql; do
  version="$(basename "${migration}")"
  checksum="$(sha256sum "${migration}" | cut -d ' ' -f 1)"
  existing="$(psql --tuples-only --no-align \
    --set version="${version}" \
    --command "SELECT sha256 FROM rmr_internal.schema_migration WHERE version = :'version'")"

  if [ -n "${existing}" ] && [ "${existing}" != "${checksum}" ]; then
    echo "Migration checksum mismatch for ${version}." >&2
    exit 65
  fi

  if [ -z "${existing}" ]; then
    {
      echo 'BEGIN;'
      cat "${migration}"
      printf "\nINSERT INTO rmr_internal.schema_migration (version, sha256) VALUES ('%s', '%s');\n" \
        "${version}" "${checksum}"
      echo 'COMMIT;'
    } | psql --set ON_ERROR_STOP=1
  fi
done

for seed in /opt/rmr/seeds/*.sql; do
  psql --set ON_ERROR_STOP=1 --file "${seed}"
done

psql --set ON_ERROR_STOP=1 --tuples-only --no-align --command \
  "SELECT fixture_key FROM rmr.synthetic_seed_marker WHERE fixture_key = 'synthetic.infrastructure.foundation.v1'"
