#!/bin/sh
set -eu

chown -R minio:minio /data

if [ -n "${MINIO_ROOT_PASSWORD_FILE:-}" ]; then
  export MINIO_ROOT_PASSWORD="$(cat "${MINIO_ROOT_PASSWORD_FILE}")"
  unset MINIO_ROOT_PASSWORD_FILE
fi

exec gosu minio minio "$@"
