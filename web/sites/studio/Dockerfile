# Base images are pinned as tag@digest across web/sites/* and services/*;
# bump the tag and the digest together.
FROM node:24-alpine3.24@sha256:a34ab6d7f6f4813f4d0c5469d74685604b962fbdbf5793a7bc7b4998ecb867c8 AS build

WORKDIR /workspace
RUN corepack enable

COPY web/package.json web/pnpm-lock.yaml web/pnpm-workspace.yaml web/tsconfig.json ./
COPY web/sites/studio/package.json sites/studio/package.json
COPY web/packages/ packages/
RUN pnpm install --frozen-lockfile

COPY web/sites/studio/ sites/studio/
RUN pnpm run build:studio

FROM node:24-alpine3.24@sha256:a34ab6d7f6f4813f4d0c5469d74685604b962fbdbf5793a7bc7b4998ecb867c8
ENV NODE_ENV=production
ENV PORT=8000
WORKDIR /app
RUN addgroup -S app && adduser -S app -G app
COPY --from=build /workspace/sites/studio/.output /app/.output
USER app
EXPOSE 8000
ENTRYPOINT ["node", ".output/server/index.mjs"]
