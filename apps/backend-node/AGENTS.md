# apps/backend-node

- Node.js entrypoint for `apps/backend`. `src/server.ts` wires concrete dependencies (DAO → repository → service) into `createApp` from `backend/src/app.ts` and serves it with `@hono/node-server`; routes and business logic stay in `apps/backend`.
- Node-only code lives here, never in `apps/backend`: DAOs backed by Node drivers (`src/dao/*.node-pg.ts`, ...) implementing the interfaces in `backend/src/dao/*.interface.ts`, and anything that uses Node APIs (`process`, `fs`, ...).
- One server serves the whole app: `apps/backend` at `/api`, and the `apps/frontend` build (`../frontend/dist`, relative to this package's directory) at `/` via `serveStatic`, with unknown non-`/api` paths falling back to `index.html`. `frontend` is a devDependency only to order builds: run `vp run -t backend-node#build` (or `vp run -r build`) so the frontend builds once before the server bundle. `apps/frontend/public/_headers` is Cloudflare-only, so security headers (CSP etc.) must be set here or by the reverse proxy in front of this server.
- `dev` runs `src/server.ts` with `tsx watch` (reloads on changes in `apps/backend` too); `build` bundles it to `dist/server.js`, which `start` runs with `node`. Port comes from `PORT` (default 8787).
- Secrets: standard environment variables (`.env`, untracked).
