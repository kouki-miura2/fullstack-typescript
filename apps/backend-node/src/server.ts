/// <reference types="node" />
import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import { createApp } from 'backend/src/app.ts'
import { createSampleDao } from 'backend/src/dao/sample.memory.ts'
import { createAuthGuard } from 'backend/src/repository/auth-guard.header.ts'
import { createSampleRepository } from 'backend/src/repository/sample.repository.ts'
import { createSampleService } from 'backend/src/service/sample.service.ts'
import { Hono } from 'hono'

const api = createApp({
  sampleService: createSampleService(createSampleRepository(createSampleDao())),
  auth: { guard: createAuthGuard(), enabled: false, excludePaths: [] },
})

// One origin: the API at `/api`, the frontend build at `/` (relative to this package's directory,
// where `start`/`dev` run). `vp run -t backend-node#build` builds it first.
const FRONTEND_DIST = '../frontend/dist'

const app = new Hono()
  .route('/', api)
  // Unknown API paths must 404, not fall through to the SPA's index.html.
  .all('/api/*', (c) => c.notFound())
  .use('*', serveStatic({ root: FRONTEND_DIST }))
  // Unknown paths fall back to index.html so vue-router's history mode works on reload.
  .get('*', serveStatic({ root: FRONTEND_DIST, path: 'index.html' }))

const port = Number(process.env.PORT ?? 8787)

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`Listening on http://localhost:${info.port}`)
})
