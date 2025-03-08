import { LoaderFunction, redirect, type ActionFunction } from '@remix-run/node'
import { gameService } from '~/services/index.server'
import { prepareGameForClient } from '~/utils/game'

export const loader: LoaderFunction = async ({ params }) => {
  const { gameId } = params
  return redirect(`/games/${gameId}`)
}

export const action: ActionFunction = async ({ request, params }) => {
  if (request.method !== 'POST') {
    return { error: 'Method not allowed' }
  }

  try {
    const { gameId } = params
    const hostId = new URL(request.url).searchParams.get('hostId')

    if (!gameId || !hostId) {
      return { error: 'Missing required fields' }
    }

    const { game } = await gameService.startGame(gameId, hostId)

    return Response.json({
      game: game ? prepareGameForClient(game, hostId) : null
    })
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unknown error' }
  }
}
