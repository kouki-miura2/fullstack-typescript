# apps/backend-node

- Node.js entrypoint for `apps/backend`. `src/server.ts` wires concrete dependencies (DAO → repository → service) into `createApp` from `backend/src/app.ts` and serves it with `@hono/node-server`; routes and business logic stay in `apps/backend`.
- Node-only code lives here, never in `apps/backend`: DAOs backed by Node drivers (`src/dao/*.node-pg.ts`, ...) implementing the interfaces in `backend/src/dao/*.interface.ts`, and anything that uses Node APIs (`process`, `fs`, ...).
- `dev` runs `src/server.ts` with `tsx watch` (reloads on changes in `apps/backend` too); `build` bundles it to `dist/server.js`, which `start` runs with `node`. Port comes from `PORT` (default 8787).
- Secrets: standard environment variables (`.env`, untracked).
