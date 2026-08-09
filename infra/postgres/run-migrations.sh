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
  case "${version}" in
    *[!A-Za-z0-9._-]*)
      echo "Unsafe migration filename: ${version}." >&2
      exit 65
      ;;
  esac
  checksum="$(sha256sum "${migration}" | cut -d ' ' -f 1)"
  existing="$(psql --tuples-only --no-align \
    --command "SELECT sha256 FROM rmr_internal.schema_migration WHERE version = '${version}'")"

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

export RMR_API_RUNTIME_PASSWORD="$(cat "${POSTGRES_API_PASSWORD_FILE}")"
export RMR_WORKER_RUNTIME_PASSWORD="$(cat "${POSTGRES_WORKER_PASSWORD_FILE}")"

psql --set ON_ERROR_STOP=1 <<'SQL'
DO $$
DECLARE
  membership record;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'rmr_api_runtime') THEN
    CREATE ROLE rmr_api_runtime;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'rmr_worker_runtime') THEN
    CREATE ROLE rmr_worker_runtime;
  END IF;

  FOR membership IN
    SELECT granted.rolname AS granted_role, member_role_row.rolname AS member_role
    FROM pg_auth_members AS memberships
    JOIN pg_roles AS granted ON granted.oid = memberships.roleid
    JOIN pg_roles AS member_role_row ON member_role_row.oid = memberships.member
    WHERE member_role_row.rolname IN ('rmr_api_runtime', 'rmr_worker_runtime')
  LOOP
    EXECUTE format('REVOKE %I FROM %I', membership.granted_role, membership.member_role);
  END LOOP;
END
$$;

\getenv api_runtime_password RMR_API_RUNTIME_PASSWORD
\getenv worker_runtime_password RMR_WORKER_RUNTIME_PASSWORD
ALTER ROLE rmr_api_runtime LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS
  PASSWORD :'api_runtime_password';
ALTER ROLE rmr_worker_runtime LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS
  PASSWORD :'worker_runtime_password';
GRANT rmr_api_public_service TO rmr_api_runtime;
GRANT rmr_core_worker_service TO rmr_worker_runtime;
SQL

unset RMR_API_RUNTIME_PASSWORD RMR_WORKER_RUNTIME_PASSWORD

psql --set ON_ERROR_STOP=1 --tuples-only --no-align --command \
  "SELECT fixture_key FROM rmr.synthetic_seed_marker WHERE fixture_key = 'synthetic.infrastructure.foundation.v1'"
