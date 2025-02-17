import type { ActionFunction } from '@remix-run/node'
import { gameService } from '~/services/index.server'
import { prepareGameForClient } from '~/utils/game'

export const action: ActionFunction = async ({ request, params }) => {
  if (request.method !== 'POST') {
    return { error: 'Method not allowed' }
  }

  try {
    const { gameId } = params
    const { playerId: hostId } = await request.json()

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
