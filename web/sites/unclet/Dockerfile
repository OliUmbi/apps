# Base images are pinned as tag@digest across web/sites/* and services/*;
# bump the tag and the digest together.
FROM node:26-alpine3.24@sha256:8996bb5821d62a8fd9bb27c1cb07462f3fdce6e47d640c6a881ead0b064ce216 AS build

WORKDIR /workspace
# Node 25+ images no longer bundle corepack, so install it pinned; the pnpm
# version still resolves from the packageManager field in web/package.json.
RUN npm install -g corepack@0.36.0 && corepack enable pnpm

COPY web/package.json web/pnpm-lock.yaml web/pnpm-workspace.yaml web/tsconfig.json ./
COPY web/sites/unclet/package.json sites/unclet/package.json
COPY web/packages/ packages/
RUN pnpm install --frozen-lockfile

COPY web/sites/unclet/ sites/unclet/
RUN pnpm run build:unclet

FROM node:26-alpine3.24@sha256:8996bb5821d62a8fd9bb27c1cb07462f3fdce6e47d640c6a881ead0b064ce216
ENV NODE_ENV=production
ENV PORT=8002
WORKDIR /app
RUN addgroup -S app && adduser -S app -G app
COPY --from=build /workspace/sites/unclet/.output /app/.output
USER app
EXPOSE 8002
ENTRYPOINT ["node", ".output/server/index.mjs"]
