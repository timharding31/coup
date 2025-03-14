import { ActionFunctionArgs } from '@remix-run/node'
import { gameService, sessionService } from '~/services/index.server'
import { Game } from '~/types'
import { BotRequest } from '~/types/request'
import { prepareGameForClient } from '~/utils/game'

export async function action({ request, params }: ActionFunctionArgs) {
  if (request.method !== 'POST') {
    console.error('Method not allowed')
    return Response.error()
  }

  await sessionService.requireAuth(request)

  try {
    const { gameId } = params
    const { method, playerId, botId } = (await request.json()) as BotRequest

    if (!gameId || !method) {
      console.error('Missing required fields')
      return Response.error()
    }

    let game: Game | null = null

    switch (method) {
      case 'ADD':
        await gameService.addBot(gameId)
        game = (await gameService.getGame(gameId)).game
        break

      case 'REMOVE':
        await gameService.removeBot(gameId, botId)
        game = (await gameService.getGame(gameId)).game
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
