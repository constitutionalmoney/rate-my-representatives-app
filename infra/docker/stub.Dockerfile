FROM node:24.19.0-bookworm-slim

WORKDIR /app
COPY --chown=node:node infra/verus/disabled-signer-stub.mjs ./disabled-signer-stub.mjs
USER node
EXPOSE 3100
CMD ["node", "disabled-signer-stub.mjs"]
