import { json } from '@remix-run/node'
import type { ActionFunction } from '@remix-run/node'
import { gameService } from '~/services/index.server'

export const action: ActionFunction = async ({ request, params, context }) => {
  if (request.method !== 'POST') {
    return { error: 'Method not allowed' }
  }

  try {
    const { gameId } = params
    const { cardId, playerId } = await request.json()

    if (!gameId || !cardId || !playerId) {
      return json({ error: 'Missing required fields' }, { status: 400 })
    }

    const result = await gameService.handleCardSelection(gameId, playerId, cardId)
    return result
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unknown error' }
  }
}
