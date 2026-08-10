FROM node:24-alpine3.24 AS build

WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY sites/zelglihof/package.json sites/zelglihof/package.json
COPY packages/ packages/

RUN pnpm install --frozen-lockfile

COPY sites/zelglihof/ sites/zelglihof/

RUN pnpm run build:zelglihof

FROM node:24-alpine3.24

WORKDIR /app

COPY --from=build /app/sites/zelglihof/.output ./.output

ENV PORT=8003
EXPOSE 8003

ENTRYPOINT ["node", ".output/server/index.mjs"]
