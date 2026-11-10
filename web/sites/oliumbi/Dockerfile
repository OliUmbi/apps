# Base images are pinned as tag@digest across web/sites/* and services/*;
# bump the tag and the digest together.
FROM node:24-alpine3.24@sha256:a34ab6d7f6f4813f4d0c5469d74685604b962fbdbf5793a7bc7b4998ecb867c8 AS build

WORKDIR /workspace
RUN corepack enable

COPY web/package.json web/pnpm-lock.yaml web/pnpm-workspace.yaml web/tsconfig.json ./
COPY web/sites/oliumbi/package.json sites/oliumbi/package.json
COPY web/packages/ packages/
RUN pnpm install --frozen-lockfile

COPY web/sites/oliumbi/ sites/oliumbi/
RUN pnpm run build:oliumbi

FROM node:24-alpine3.24@sha256:a34ab6d7f6f4813f4d0c5469d74685604b962fbdbf5793a7bc7b4998ecb867c8
ENV NODE_ENV=production
ENV PORT=8004
WORKDIR /app
RUN addgroup -S app && adduser -S app -G app
COPY --from=build /workspace/sites/oliumbi/.output /app/.output
USER app
EXPOSE 8004
ENTRYPOINT ["node", ".output/server/index.mjs"]
