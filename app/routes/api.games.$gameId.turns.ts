import type { ActionFunction } from '@remix-run/node'
import { gameService, sessionService } from '~/services/index.server'
import { Game } from '~/types'
import { TurnRequest } from '~/types/request'
import { prepareGameForClient } from '~/utils/game'

export const action: ActionFunction = async ({ request, params }) => {
  if (request.method !== 'POST') {
    console.error('Method not allowed')
    return Response.error()
  }

  const { type: authType } = await sessionService.requireAuth(request)

  try {
    const { gameId } = params
    const { type, playerId, action, response, blockCard } = (await request.json()) as TurnRequest

    if (!gameId || !playerId || !type) {
      console.error('Missing required fields')
      return Response.error()
    }

    switch (type) {
      case 'ACTION':
        if (!action) {
          throw new Error('Missing required fields')
        }
        await gameService.startGameTurn(gameId, action)
        break

      case 'RESPONSE':
        if (!response) {
          throw new Error('Missing required fields')
        }
        await gameService.handleResponse(gameId, playerId, response, blockCard)
        break

      case 'ADVANCE':
        if (authType === 'service') {
          await gameService.advanceTurnState(gameId)
        } else {
          throw new Error('Players cannot advance turn state manually')
        }
        break
    }

    return Response.json({ success: true })
  } catch (error) {
    return new Response(error instanceof Error ? error.message : 'Internal server error', { status: 500 })
  }
}
