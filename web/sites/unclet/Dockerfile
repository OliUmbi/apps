FROM node:24-alpine3.24 AS build

WORKDIR /app
RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.json ./
COPY sites/unclet/package.json sites/unclet/package.json
COPY packages/ packages/
RUN pnpm install --frozen-lockfile

COPY sites/unclet/ sites/unclet/
RUN pnpm run build:unclet

FROM node:24-alpine3.24
WORKDIR /app
COPY --from=build /app/sites/unclet/.output ./.output
ENV PORT=8002
EXPOSE 8002
ENTRYPOINT ["node", ".output/server/index.mjs"]
