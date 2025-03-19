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
    const formData = await request.formData()
    const type = formData.get('type')?.toString()
    const playerId = formData.get('playerId')?.toString()
    const botId = formData.get('botId')?.toString()

    if (!gameId || !type || !playerId) {
      console.error('Missing required fields')
      return Response.error()
    }

    let game: Game | null = null

    switch (type) {
      case 'ADD':
        await gameService.addBot(gameId)
        game = (await gameService.getGame(gameId)).game
        break

      case 'REMOVE':
        if (!botId) {
          console.error('Missing required fields')
          return Response.error()
        }
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
