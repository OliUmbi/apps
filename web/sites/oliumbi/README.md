# oliumbi

A temporary, static English placeholder for oliumbi.ch. It shows the Oliumbi
name, one line of introduction and links to GitHub and the three existing
sites. There is no database, no Java service and no i18n package here: the
wording lives directly in the route.

The site uses the shared TanStack Start, Vite and Tailwind setup and listens on
port 8004.

## Run it

From `web/`:

```powershell
pnpm install
pnpm dev:oliumbi
```

Open <http://localhost:8004>. A production build is available with:

```powershell
pnpm --filter oliumbi build
pnpm --filter oliumbi start
```

The dev compose rig can build and run it as the `oliumbi` service on
`http://localhost:8004`:

```powershell
docker compose -f infrastructure/compose.dev.yaml --env-file .env up -d --build oliumbi
```

This site is a stand-in until oliumbi.ch gets its real content. Replacing it
does not require any schema or service changes.
