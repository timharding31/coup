import { createRequestHandler } from '@remix-run/express'
import { broadcastDevReady } from '@remix-run/node'
import express from 'express'
import { createServer } from 'http'
import { Server as SocketServer } from 'socket.io'
import { gameService, playerService, sessionService, socketService } from './app/services/index.server'

const app = express()
const httpServer = createServer(app)
const io = new SocketServer(httpServer, {
  cors: {
    origin: process.env.SOCKET_URL,
    methods: ['GET', 'POST']
  }
})

app.use(express.static('public'))

const BUILD_PATH = './build/index.js'

const getLoadContext = () => ({
  gameService,
  socketService,
  sessionService,
  playerService
})

const init = async () => {
  const build = await import(BUILD_PATH)

  // Initialize socket service with the IO instance
  socketService.setupEventHandlers(io)

  app.all(
    '*',
    createRequestHandler({
      build,
      mode: process.env.NODE_ENV,
      getLoadContext
    })
  )

  const port = process.env.PORT || 3000
  httpServer.listen(port, () => {
    console.log(`Express server listening on port ${port}`)
    if (process.env.NODE_ENV === 'development') {
      broadcastDevReady(build)
    }
  })
}

init().catch(console.error)
