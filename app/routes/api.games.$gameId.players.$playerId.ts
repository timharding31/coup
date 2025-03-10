import type { ActionFunction } from '@remix-run/node'
import { gameService } from '~/services/index.server'
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

    const { player } = await gameService.updatePlayer(playerId, playerUpdates)
    return Response.json({ player })
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unknown error' }
  }
}
