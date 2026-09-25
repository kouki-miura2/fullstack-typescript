# Vite+ Monorepo Starter

A starter for creating a Vite+ monorepo, with `apps/backend`, `apps/frontend`, and
`packages/utils`. `apps/backend` is a Hono API (deployable to Cloudflare Workers or as a
standalone Node.js server), `apps/frontend` is a Vue 3 + Vuetify 4 client that talks to it through
Hono RPC (typed request/response, no hand-shared types package), and `packages/utils` holds
runtime-agnostic code shared by both.

## Setting Up a New Project

This repo is a template. To start a new project from it:

1. Clone it under the new project's name:

```bash
git clone https://github.com/kouki-miura2/fullstack-typescript.git my-new-project
cd my-new-project
```

2. Point it at the new project's own remote instead of this template's:

```bash
rm -rf .git
git init
git remote add origin <new-project-repo-url>
```

3. Rename the project in the files that hard-code the template's name:

- Root `package.json` — `name`
- `apps/backend/wrangler.jsonc` — `name` (the deployed Cloudflare Worker's name)
- `apps/frontend/index.html` — `<title>`
- `README.md` — title and description (this file)

4. Install dependencies and confirm everything works:

```bash
vp install
vp run ready
```

5. Commit the result and push to the new remote:

```bash
git add -A
git commit -m "chore: initial commit from fs-ts template"
git push -u origin main
```

## Development

- Check everything is ready:

```bash
vp run ready
```

- Run all tests:

```bash
vp run -r test
```

- Build everything:

```bash
vp run -r build
```

## packages/utils

- Run format/lint/type checks:

```bash
vp run utils#check
```

- Run the tests:

```bash
vp run utils#test
```

## apps/backend

Deployable to Cloudflare Workers or as a standalone Node.js server. Pick the runtime section(s) a given project needs.

Script naming: no suffix = common (runtime-agnostic) or Cloudflare Workers, `:node` suffix = Node.js.

### Common

- Run format/lint/type checks:

```bash
vp run backend#check
```

- Run the tests:

```bash
vp run backend#test
```

### Cloudflare Workers

- Debug locally:

```bash
vp run backend#dev
```

- Build (dry-run bundle):

```bash
vp run backend#build
```

- Deploy:

```bash
vp run backend#deploy
```

- Regenerate Workers binding types:

```bash
vp run backend#cf-typegen
```

### Node.js

- Debug locally (hot reload):

```bash
vp run backend#dev:node
```

- Build:

```bash
vp run backend#build:node
```

- Run the built bundle:

```bash
vp run backend#start:node
```

## apps/frontend

- Run format/lint/type checks:

```bash
vp run frontend#check
```

- Run the tests:

```bash
vp run frontend#test
```

- Run the dev server:

```bash
vp run frontend#dev
```

- Build:

```bash
vp run frontend#build
```

- Preview the production build:

```bash
vp run frontend#preview
```
