# Base images are pinned as tag@digest across web/sites/* and services/*;
# bump the tag and the digest together.
FROM node:26-alpine3.24@sha256:8996bb5821d62a8fd9bb27c1cb07462f3fdce6e47d640c6a881ead0b064ce216 AS build

WORKDIR /workspace
# Node 25+ images no longer bundle corepack, so install it pinned; the pnpm
# version still resolves from the packageManager field in web/package.json.
RUN npm install -g corepack@0.36.0 && corepack enable pnpm

COPY web/package.json web/pnpm-lock.yaml web/pnpm-workspace.yaml web/tsconfig.json ./
COPY web/sites/jublawoma/package.json sites/jublawoma/package.json
COPY web/packages/ packages/
RUN pnpm install --frozen-lockfile

COPY web/sites/jublawoma/ sites/jublawoma/
RUN pnpm run build:jublawoma

FROM node:26-alpine3.24@sha256:8996bb5821d62a8fd9bb27c1cb07462f3fdce6e47d640c6a881ead0b064ce216
ENV NODE_ENV=production
ENV PORT=8001
WORKDIR /app
RUN addgroup -S app && adduser -S app -G app
COPY --from=build /workspace/sites/jublawoma/.output /app/.output
USER app
EXPOSE 8001
ENTRYPOINT ["node", ".output/server/index.mjs"]
