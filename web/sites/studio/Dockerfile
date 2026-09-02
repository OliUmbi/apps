FROM node:24-alpine AS build
RUN corepack enable
WORKDIR /workspace
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.json ./
COPY packages ./packages
COPY sites/studio ./sites/studio
RUN pnpm install --frozen-lockfile
RUN pnpm --filter studio build

FROM node:24-alpine
ENV NODE_ENV=production
ENV PORT=8000
WORKDIR /app
COPY --from=build /workspace/sites/studio/.output ./.output
EXPOSE 8000
CMD ["node", ".output/server/index.mjs"]
