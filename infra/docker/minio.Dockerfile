# syntax=docker/dockerfile:1.7

FROM golang:1.24.8-bookworm AS build

ARG MINIO_VERSION=RELEASE.2025-10-15T17-29-55Z
RUN CGO_ENABLED=0 go install "github.com/minio/minio@${MINIO_VERSION}"

FROM debian:bookworm-slim AS runtime

RUN apt-get update \
  && apt-get install --yes --no-install-recommends ca-certificates curl gosu \
  && rm -rf /var/lib/apt/lists/* \
  && useradd --create-home --uid 10001 minio \
  && mkdir -p /data \
  && chown minio:minio /data
COPY --from=build /go/bin/minio /usr/local/bin/minio
COPY infra/object-storage/minio-entrypoint.sh /usr/local/bin/minio-entrypoint
RUN chmod 0755 /usr/local/bin/minio-entrypoint
EXPOSE 9000 9001
ENTRYPOINT ["/usr/local/bin/minio-entrypoint"]
CMD ["server", "/data", "--console-address", ":9001"]
