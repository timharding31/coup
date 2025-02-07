import type { ActionFunction } from '@remix-run/node'
import { gameService } from '~/services/index.server'

export const action: ActionFunction = async ({ request, params, context }) => {
  if (request.method !== 'POST') {
    return { error: 'Method not allowed' }
  }

  try {
    const { gameId } = params
    const { action, playerId } = await request.json()

    if (!gameId || !action || !playerId) {
      return { error: 'Missing required fields' }
    }

    const result = await gameService.startGameTurn(gameId, action)

    return result
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unknown error' }
  }
}
