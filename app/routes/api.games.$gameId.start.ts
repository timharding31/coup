import type { ActionFunction } from '@remix-run/node'
import { gameService } from '~/services/index.server'

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

    return gameService.startGame(gameId, hostId)
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unknown error' }
  }
}
