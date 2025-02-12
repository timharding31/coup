import type { ActionFunction } from '@remix-run/node'
import { gameService } from '~/services/index.server'

export const action: ActionFunction = async ({ request, params }) => {
  if (request.method !== 'POST') {
    return { error: 'Method not allowed' }
  }

  try {
    const { gameId } = params
    const { cardIds, playerId } = await request.json()

    if (!gameId || !cardIds?.length || !playerId) {
      return { error: 'Missing required fields' }
    }

    return gameService.handleExchangeReturn(gameId, playerId, cardIds)
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unknown error' }
  }
}
