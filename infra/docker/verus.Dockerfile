# syntax=docker/dockerfile:1.7

FROM ubuntu:24.04

ARG TARGETARCH
ARG VERUS_VERSION=v1.2.16-1
ARG VERUS_AMD64_SHA256=c6f8fc39afca8f2b5abf2f2f8b40619ad6b2ef2741ad39402d83c29d258a1669
ARG VERUS_ARM64_SHA256=40542ab3252f9c4466755bd1b47ec163e69b7041538338cf0cf7a82fb6e79285

RUN apt-get update \
  && apt-get install --yes --no-install-recommends ca-certificates curl gosu libexpat1 libstdc++6 \
  && rm -rf /var/lib/apt/lists/*

RUN set -eux; \
  case "${TARGETARCH}" in \
    amd64) asset_arch=x86_64; asset_sha="${VERUS_AMD64_SHA256}" ;; \
    arm64) asset_arch=arm64; asset_sha="${VERUS_ARM64_SHA256}" ;; \
    *) echo "Unsupported architecture: ${TARGETARCH}" >&2; exit 1 ;; \
  esac; \
  asset="Verus-CLI-Linux-${VERUS_VERSION}-${asset_arch}"; \
  curl --fail --location --silent --show-error \
    "https://github.com/VerusCoin/VerusCoin/releases/download/${VERUS_VERSION}/${asset}.tgz" \
    --output /tmp/verus.tgz; \
  echo "${asset_sha}  /tmp/verus.tgz" | sha256sum --check -; \
  tar -xzf /tmp/verus.tgz -C /tmp; \
  tar -xzf "/tmp/${asset}.tar.gz" -C /opt; \
  mv /opt/verus-cli /opt/verus; \
  rm -rf /tmp/verus.tgz "/tmp/${asset}.tar.gz" "/tmp/${asset}.tar.gz.signature.txt"

RUN useradd --create-home --uid 10002 verus \
  && mkdir -p /var/lib/verus /home/verus/.zcash-params /run/verus \
  && chown -R verus:verus /var/lib/verus /home/verus/.zcash-params /run/verus

ENV HOME=/home/verus

COPY infra/verus/entrypoint.sh /usr/local/bin/verus-entrypoint
RUN chmod 0755 /usr/local/bin/verus-entrypoint

EXPOSE 27486
ENTRYPOINT ["/usr/local/bin/verus-entrypoint"]
CMD ["verusd"]
