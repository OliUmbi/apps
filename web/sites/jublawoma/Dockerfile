FROM node:24-alpine3.24 AS build

WORKDIR /app
RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.json ./
COPY sites/jublawoma/package.json sites/jublawoma/package.json
COPY packages/ packages/
RUN pnpm install --frozen-lockfile

COPY sites/jublawoma/ sites/jublawoma/
RUN pnpm run build:jublawoma

FROM node:24-alpine3.24
WORKDIR /app
COPY --from=build /app/sites/jublawoma/.output ./.output
ENV PORT=8001
EXPOSE 8001
ENTRYPOINT ["node", ".output/server/index.mjs"]
