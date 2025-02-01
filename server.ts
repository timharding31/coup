import { createRequestHandler } from '@remix-run/express'
import { broadcastDevReady } from '@remix-run/node'
import { app, gameService, httpServer, playerService, sessionService, socketService } from './app/services/index.server'
import type { AppContext } from '~/types'
import express from 'express'

app.use(express.static('public'))

const BUILD_PATH = './build/index.js'

// Define context function outside to ensure consistency
const getLoadContext = (): AppContext => ({
  gameService,
  socketService,
  sessionService,
  playerService
})

const init = async () => {
  const build = await import(BUILD_PATH)

  // Use the context directly in the request handler
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
