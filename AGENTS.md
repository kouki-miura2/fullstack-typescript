# AGENTS.md

## Project Structure

Monorepo managed with pnpm workspaces (`apps/*`, `packages/*`). Project-specific conventions live in that project's own `AGENTS.md`, not here — read it before working in that folder.

- `apps/backend` — API server (Hono): runtime-agnostic routes and business logic, no entrypoint. See `apps/backend/AGENTS.md`.
- `apps/backend-worker` — Runs `apps/backend` on Cloudflare Workers. See `apps/backend-worker/AGENTS.md`.
- `apps/backend-node` — Runs `apps/backend` as a standalone Node.js server. See `apps/backend-node/AGENTS.md`.
- `apps/frontend` — Web client (Vue 3 + Vuetify 4). See `apps/frontend/AGENTS.md`.
- `packages/utils` — Shared runtime utilities (app-wide limits, date/time helpers, character counting, logger). See `packages/utils/AGENTS.md`.
- `docs/spec.md` — App specification (features, permissions, limits, architecture, data model). Read it before implementing or changing behavior, and keep it in sync when the behavior changes.

## Conventions

- Co-location: `foo/bar.ts` + `foo/bar.test.ts`.
- Arrow functions everywhere (`const foo = (...) => {}`), no `function` declarations — one style repo-wide, including `packages/utils`, so there's no per-case judgment call.
- Favor less code: reach for a framework's built-in feature over a hand-rolled one, avoid speculative abstractions and shared packages "just in case", and don't introduce a layer until it earns its keep.
- One origin in development and production: the frontend at `/`, the API at `/api`. In development `vp run frontend#dev` proxies `/api` to the backend dev server (`localhost:8787`); in production the runtime package serves both (see its `AGENTS.md`).
- API request/response types are not hand-shared: `apps/frontend` gets them from `apps/backend` via Hono RPC, not from a separate types package.
- Runtime-agnostic shared code goes in `packages/utils`, not duplicated per app.
- Committing goes through the `github-committer` agent. When delegating to it, include in the task prompt the `Co-Authored-By:` trailer line from your own attribution reminder, verbatim, so the commit credits the model the user is working with rather than the subagent's.

### Public config values for the frontend

Values that aren't secret but differ per environment (e.g. a Google OAuth web client ID, a VAPID public key, the operator's name in the terms) reach the frontend as build-time env vars (`import.meta.env.VITE_*`). Don't add an API that returns config values (e.g. `GET /api/config`).

- Put environment-specific values in `apps/frontend/.env.local` (gitignored). `apps/frontend/.env` is committed and public: it may hold values that are the same everywhere (e.g. `VITE_APP_TITLE`), but lists environment-specific variables only as commented-out names with a description, never their values:
  ```
  # VITE_GOOGLE_WEB_CLIENT_ID=<web OAuth client id>
  # VITE_VAPID_PUBLIC_KEY=<VAPID public key>   # only if Web Push is used
  ```
- Declare each variable in `ImportMetaEnv` (`apps/frontend/src/vite-env.d.ts`) as optional (`readonly VITE_X?: string`), so a missing value is a type-level `undefined` the code has to handle. Fall back with `||`, not `??`: a variable left empty (`VITE_X=`) is `''`, not `undefined`.
- Values only the backend uses (the client ID accepted as the ID token's `aud`, the VAPID private key) are registered as secrets through the runtime package (`wrangler secret put`, locally `.dev.vars`, for `apps/backend-worker`; environment variables, locally `.env`, for `apps/backend-node`; see its `AGENTS.md`), never in committed config such as `wrangler.jsonc` `vars`, so the public repository holds no environment-specific values.
- The app must still run when a value is unset (e.g. without a client ID, see "Sign in with Google" below).
- Why: one fewer API, one fewer request at startup, one fewer loading state. The values only change on deploy, so baking them into the build costs nothing.
- Note: `VITE_*` values are baked into the published build, so anyone can read them. This keeps them out of the repository; it doesn't keep them secret.
- When adding a value, list every place it must be set (e.g. the client ID: `apps/frontend/.env.local` and the backend secret) under the runtime package's deploy step in `README.md`.

### Sign in with Google and terms consent

When the app uses Sign in with Google, follow this flow. It spans the frontend and the backend; UI details are in `apps/frontend/AGENTS.md`. Record the chosen behavior in `docs/spec.md` ("共通ルール > 同意").

The official Google sign-in button (Google Identity Services) can't be disabled, so don't design the login screen to keep the button disabled until a consent checkbox is ticked. Use this order instead:

1. The welcome screen shows the official Google button, which can be pressed before consenting.
2. The API verifies the ID token from the sign-in. A registered user whose agreed terms version is current goes straight to the home screen.
3. An unregistered user gets the consent screen: links to the terms of service and privacy policy, and a consent checkbox. "同意してはじめる" stays disabled until it's ticked.
4. After consent, call the registration API with the ID token and the terms version agreed to. The user is created only then.

- Consent is recorded on the server, so there's no need to ask for it before the sign-in button is pressed.
- The terms version (`TERMS_VERSION`) lives in `packages/utils`, so the frontend and the backend read the same value. It's the revision date as a `YYYY-MM-DD` string, so string comparison orders it, and the database stores it as text. Whenever the terms or privacy policy text changes, set it to the revision date.
- When the terms are revised, a registered user whose stored version is older than `TERMS_VERSION` gets the consent screen again the next time the app is opened, and agreeing calls a re-consent API that updates the stored version. The backend enforces this too: until the user re-consents, it rejects other API calls with a status the frontend maps to the consent screen, so an old client can't skip it.
- Without a client ID, a development login may stand in for Google, for local development only: the frontend shows it only when `import.meta.env.DEV` is true, and the backend accepts it only when its runtime package enables it explicitly in development (never by default, never in a production build or deploy). The bundled `auth-guard.header.ts` placeholder trusts any `Authorization` header as a user id, so it must never be what a deployed app runs.

<!--VITE PLUS START-->

# Using Vite+, the Unified Toolchain for the Web

This project is using Vite+, a unified toolchain built on top of Vite, Rolldown, Vitest, tsdown, Oxlint, Oxfmt, and Vite Task. Vite+ wraps runtime management, package management, and frontend tooling in a single global CLI called `vp`. Vite+ is distinct from Vite, and it invokes Vite through `vp dev` and `vp build`. Run `vp help` to print a list of commands and `vp <command> --help` for information about a specific command.

Docs are local at `node_modules/vite-plus/docs` or online at https://viteplus.dev/guide/.

## Built-in Commands vs Scripts

`vp <name>` runs a built-in command. `vp run <name>` runs a `package.json` script or a `vite.config.ts` task. Scripts cannot overwrite built-ins, so `vp dev` and `vp run dev` may do different things. Check `package.json` and `vite.config.ts` first, and run `vp run <name>` when the project defines a script or task with that name.

## Tool Versions

Run `vp toolchain` to show versions and relationships in the active Vite+
release. Add a tool name to select part of the graph. For example, run
`vp toolchain vite`. Use `--global` to ignore the local `vite-plus` package. Use
`vp why <package>` to show the package-manager dependency graph.

## Review Checklist

- [ ] Run `vp install` after pulling remote changes and before getting started.
- [ ] Run `vp check` and `vp test` to format, lint, type check and test changes.
- [ ] Check if there are `vite.config.ts` tasks or `package.json` scripts necessary for validation, run via `vp run <script>`.
- [ ] If setup, runtime, or package-manager behavior looks wrong, run `vp env doctor` and include its output when asking for help.

<!--VITE PLUS END-->
