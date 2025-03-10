import type { ActionFunction } from '@remix-run/node'
import { gameService } from '~/services/index.server'
import { prepareGameForClient } from '~/utils/game'

export const action: ActionFunction = async ({ request, params }) => {
  if (request.method !== 'POST') {
    return { error: 'Method not allowed' }
  }

  try {
    const { gameId } = params
    const { cardId, playerId } = await request.json()

    if (!gameId || !cardId || !playerId) {
      return { error: 'Missing required fields' }
    }

    const { game } = await gameService.handleCardSelection(gameId, playerId, cardId)

    return Response.json({
      game: game ? prepareGameForClient(game, playerId) : null
    })
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unknown error' }
  }
}
