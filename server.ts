import 'dotenv/config'
import { createRequestHandler } from '@remix-run/express'
import { broadcastDevReady, ServerBuild } from '@remix-run/node'
import express from 'express'
import { createServer } from 'http'
import { Server as SocketServer } from 'socket.io'
import { gameService, playerService, sessionService, socketService } from './app/services/index.server.js'
import compression from 'compression'
import morgan from 'morgan'
import * as path from 'path'

console.log('Environment Variables:', {
  SOCKET_URL: process.env.SOCKET_URL,
  NODE_ENV: process.env.NODE_ENV
})

// To verify the environment variables are loaded, you can add this:
if (
  !process.env.FIREBASE_PROJECT_ID ||
  !process.env.FIREBASE_CLIENT_EMAIL ||
  !process.env.FIREBASE_PRIVATE_KEY ||
  !process.env.FIREBASE_DATABASE_URL
) {
  throw new Error('Missing required Firebase environment variables')
}

if (!process.env.SOCKET_URL) {
  throw new Error('SOCKET_URL environment variable is not set')
}

const viteDevServer =
  process.env.NODE_ENV === 'production'
    ? undefined
    : await import('vite').then(vite =>
        vite.createServer({
          clearScreen: false,
          appType: 'custom',
          server: { middlewareMode: true, port: 3000, host: 'localhost' }
        })
      )

const app = express()
const httpServer = createServer(app)

app.use(compression())
app.disable('x-powered-by')

const io = new SocketServer(httpServer, {
  cors: {
    origin: process.env.SOCKET_URL,
    methods: ['GET', 'POST']
  }
})

if (viteDevServer) {
  app.use(viteDevServer.middlewares)
} else {
  // Vite fingerprints its assets so we can cache forever.
  app.use('/assets', express.static('build/client/assets', { immutable: true, maxAge: '1y' }))
  app.use(express.static('build/client', { maxAge: '1h' }))
}

app.use(morgan('tiny'))

app.use(express.static('public'))

// Initialize socket service with the IO instance
socketService.setupEventHandlers(io)

const remixBuildPath = path.join(process.cwd(), 'build', 'server', 'index.js')

const remixHandler = createRequestHandler({
  build: viteDevServer
    ? () => viteDevServer.ssrLoadModule('virtual:remix/server-build') as Promise<ServerBuild>
    : ((await import(remixBuildPath)) as ServerBuild),
  getLoadContext: () => ({
    gameService,
    socketService,
    sessionService,
    playerService
  }),
  mode: process.env.NODE_ENV
})

app.all('*', remixHandler)

const port = process.env.PORT || 3000
httpServer.listen(port, async () => {
  console.log(`Express server listening on port ${port}`)
  if (process.env.NODE_ENV === 'development') {
    const build = await viteDevServer?.ssrLoadModule('virtual:remix/server-build')
    if (build) {
      broadcastDevReady(build as ServerBuild, `http://localhost:${port}`)
    }
  }
})
