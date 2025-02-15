import type { ActionFunction } from '@remix-run/node'
import { playerService } from '~/services/index.server'
import { Player } from '~/types'

export const action: ActionFunction = async ({ request, params }) => {
  if (request.method !== 'POST') {
    return { error: 'Method not allowed' }
  }

  try {
    const { gameId, playerId } = params
    const playerUpdates = (await request.json()) as Partial<Player>

    if (!gameId || !playerId) {
      return { error: 'Missing required fields' }
    }

    await playerService.updatePlayer(playerId, playerUpdates)
    return { success: true }
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unknown error' }
  }
}
