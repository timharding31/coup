import { ActionFunction, LoaderFunction } from '@remix-run/node'
import { gameService } from '~/services/index.server'

export const loader: LoaderFunction = async () => {
  return null
}

export const action: ActionFunction = async ({ request, params }) => {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }
  const gameId = params.gameId!
  try {
    const { game } = await gameService.advanceTurnState(gameId)
    if (game) {
      return new Response('Success', { status: 200 })
    }
    throw new Error('Error advancing turn state')
  } catch (error) {
    console.error(error)
    return Response.error()
  }
}
