#!/bin/sh
set -eu

chown -R minio:minio /data
exec gosu minio minio "$@"
