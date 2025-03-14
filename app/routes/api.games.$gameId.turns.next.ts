import { ActionFunction, LoaderFunction } from '@remix-run/node'
import { gameService, sessionService } from '~/services/index.server'

export const loader: LoaderFunction = async () => {
  return null
}

export const action: ActionFunction = async ({ request, params }) => {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  try {
    const auth = await sessionService.requireAuth(request)

    switch (auth.type) {
      case 'user':
        return new Response('Unauthorized', { status: 401 })

      case 'service':
        const { game } = await gameService.advanceTurnState(params.gameId!)
        if (game) {
          return new Response('Success', { status: 200 })
        }
        throw new Error('Error advancing turn state')

      default:
        return new Response('Unauthorized', { status: 401 })
    }
  } catch (error) {
    console.error(error)
    return new Response(error instanceof Error ? error.message : 'Internal server error', { status: 500 })
  }
}
