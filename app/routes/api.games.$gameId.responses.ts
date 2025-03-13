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
    const { response, playerId, blockCard } = await request.json()

    if (!gameId || !response || !playerId) {
      console.error('Missing required parameters')
      return Response.error()
    }

    const { game } = await gameService.handleResponse(gameId, playerId, response, blockCard)

    return Response.json({
      game: game ? prepareGameForClient(game, playerId) : null
    })
  } catch (error) {
    console.error(error)
    return Response.error()
  }
}
