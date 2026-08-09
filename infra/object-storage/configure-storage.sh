#!/bin/sh
set -eu

root_password="$(cat /run/secrets/minio_root_password)"
api_password="$(cat /run/secrets/minio_api_password)"
quarantine_password="$(cat /run/secrets/minio_quarantine_password)"
private_password="$(cat /run/secrets/minio_private_password)"
manifest_password="$(cat /run/secrets/minio_manifest_password)"

mc alias set -- local "${MINIO_ENDPOINT}" "${MINIO_ROOT_USER}" "${root_password}"
mc mb --ignore-existing \
  local/rmr-public \
  local/rmr-public-manifests \
  local/rmr-quarantine \
  local/rmr-private-evidence

mc anonymous set none local/rmr-private-evidence
mc anonymous set none local/rmr-quarantine
mc anonymous set download local/rmr-public
mc anonymous set download local/rmr-public-manifests

mc admin policy create local rmr-api-public-reader /opt/rmr/policies/api-public-reader.json
mc admin policy create local rmr-quarantine-worker /opt/rmr/policies/quarantine-worker.json
mc admin policy create local rmr-private-worker /opt/rmr/policies/private-worker.json
mc admin policy create local rmr-manifest-writer /opt/rmr/policies/manifest-writer.json

mc admin user add -- local "${MINIO_API_USER}" "${api_password}"
mc admin user add -- local "${MINIO_QUARANTINE_USER}" "${quarantine_password}"
mc admin user add -- local "${MINIO_PRIVATE_USER}" "${private_password}"
mc admin user add -- local "${MINIO_MANIFEST_USER}" "${manifest_password}"
mc admin policy attach local rmr-api-public-reader --user "${MINIO_API_USER}"
mc admin policy attach local rmr-quarantine-worker --user "${MINIO_QUARANTINE_USER}"
mc admin policy attach local rmr-private-worker --user "${MINIO_PRIVATE_USER}"
mc admin policy attach local rmr-manifest-writer --user "${MINIO_MANIFEST_USER}"

mc cp /opt/rmr/fixtures/approved-public-record.json \
  local/rmr-public/records/synthetic-foundation.json
mc cp /opt/rmr/fixtures/approved-manifest.json \
  local/rmr-public-manifests/synthetic-foundation.json
mc cp /opt/rmr/fixtures/quarantine-object.txt \
  local/rmr-quarantine/synthetic-quarantine-object.txt
mc cp /opt/rmr/fixtures/private-object.txt \
  local/rmr-private-evidence/synthetic-private-object.txt

echo 'Four classified object-storage buckets and isolated policies are ready.'
