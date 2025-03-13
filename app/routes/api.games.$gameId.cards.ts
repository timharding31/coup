import type { ActionFunction } from '@remix-run/node'
import { gameService } from '~/services/index.server'
import { prepareGameForClient } from '~/utils/game'

export const action: ActionFunction = async ({ request, params }) => {
  if (request.method !== 'POST') {
    console.error('Method not allowed')
    return Response.error()
  }

  try {
    const { gameId } = params
    const { cardId, playerId } = await request.json()

    if (!gameId || !cardId || !playerId) {
      console.error('Missing required fields')
      return Response.error()
    }

    const { game } = await gameService.handleCardSelection(gameId, playerId, cardId)

    return Response.json({
      game: game ? prepareGameForClient(game, playerId) : null
    })
  } catch (error) {
    console.error(error)
    return Response.error()
  }
}
