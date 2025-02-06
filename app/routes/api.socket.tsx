import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node'
import { Server as SocketServer } from 'socket.io'
import { gameService, socketService } from '~/services/index.server'
import { AppContext } from '~/types'

declare global {
  var io: SocketServer | undefined
}

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
  const { socketService } = context as AppContext
  // Handle WebSocket upgrade
  if (request.headers.get('upgrade') === 'websocket') {
    if (!global.io) {
      global.io = new SocketServer({
        cors: {
          origin: process.env.SOCKET_URL,
          methods: ['GET', 'POST']
        },
        path: '/api/socket'
      })

      // Set up your socket event handlers here
      // Move your socket setup logic from socket.server.ts
      socketService.setupEventHandlers(global.io)
    }

    return new Response(null, {
      status: 101, // Switching protocols
      headers: {
        Upgrade: 'websocket',
        Connection: 'Upgrade'
      }
    })
  }

  return new Response('WebSocket endpoint', { status: 200 })
}

// Optionally handle POST requests if needed
export const action = async ({ request }: ActionFunctionArgs) => {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  // Handle any POST requests to this endpoint
  return new Response('OK', { status: 200 })
}
