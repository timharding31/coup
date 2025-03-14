import type { ActionFunction } from '@remix-run/node'
import { gameService, sessionService } from '~/services/index.server'
import { Game } from '~/types'
import { CardRequest } from '~/types/request'
import { prepareGameForClient } from '~/utils/game'

export const action: ActionFunction = async ({ request, params }) => {
  if (request.method !== 'POST') {
    console.error('Method not allowed')
    return Response.error()
  }

  await sessionService.requireAuth(request)

  try {
    const { gameId } = params
    const { method, playerId, cardId, cardIds } = (await request.json()) as CardRequest

    if (!gameId || !playerId || !method) {
      console.error('Missing required fields')
      return Response.error()
    }

    let game: Game | null = null

    switch (method) {
      case 'SELECT':
        game = (await gameService.handleCardSelection(gameId, playerId, cardId)).game
        break

      case 'EXCHANGE':
        game = (await gameService.handleExchangeReturn(gameId, playerId, cardIds)).game
        break
    }

    if (!game) {
      throw new Error('Internal server error')
    }

    return Response.json({ game: prepareGameForClient(game, playerId) })
  } catch (error) {
    return new Response(error instanceof Error ? error.message : 'Internal server error', { status: 500 })
  }
}
