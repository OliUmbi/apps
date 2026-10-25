# Base images are pinned as tag@digest across web/sites/* and services/*;
# bump the tag and the digest together.
FROM node:24-alpine3.24@sha256:06d7adf3e0ef61a13f1d28682726366f97a15aa1888c934d3ecec86c33918b53 AS build

WORKDIR /workspace
RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.json ./
COPY sites/zelglihof/package.json sites/zelglihof/package.json
COPY packages/ packages/
RUN pnpm install --frozen-lockfile

COPY sites/zelglihof/ sites/zelglihof/
RUN pnpm run build:zelglihof

FROM node:24-alpine3.24@sha256:06d7adf3e0ef61a13f1d28682726366f97a15aa1888c934d3ecec86c33918b53
ENV NODE_ENV=production
ENV PORT=8003
WORKDIR /app
RUN addgroup -S app && adduser -S app -G app
COPY --from=build /workspace/sites/zelglihof/.output /app/.output
USER app
EXPOSE 8003
ENTRYPOINT ["node", ".output/server/index.mjs"]
