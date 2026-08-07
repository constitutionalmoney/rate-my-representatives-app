# syntax=docker/dockerfile:1.7

FROM node:24.19.0-bookworm-slim AS build

ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH

RUN corepack enable && corepack prepare pnpm@11.20.0 --activate
WORKDIR /workspace
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm generate:contracts && pnpm --filter @rmr/api... build
RUN pnpm --filter @rmr/api deploy --prod --legacy /opt/api

FROM node:24.19.0-bookworm-slim AS runtime

ENV NODE_ENV=production
WORKDIR /app
COPY --from=build --chown=node:node /opt/api/ ./
USER node
EXPOSE 3000
CMD ["node", "dist/server.js"]
