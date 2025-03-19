import { ActionFunction, LoaderFunction, redirect } from '@remix-run/node'
import { gameService, sessionService } from '~/services/index.server'
import { Game } from '~/types'
import { GameRequest } from '~/types/request'
import { prepareGameForClient } from '~/utils/game'

export const action: ActionFunction = async ({ request }) => {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }
  await sessionService.requireAuth(request)

  try {
    const formData = await request.formData()
    const type = formData.get('type')?.toString()
    const gameId = formData.get('gameId')?.toString()
    const playerId = formData.get('playerId')?.toString()

    if (!type || !gameId || !playerId) {
      return new Response('Bad Request', { status: 400 })
    }

    let game: Game | null

    switch (type) {
      case 'LEAVE':
        await gameService.leaveGame(playerId, gameId)
        return redirect('/')

      case 'START':
        game = (await gameService.startGame(gameId, playerId)).game
        if (game) return redirect(`/games/${game.id}`)
        break

      case 'REMATCH':
        const { newGameId } = await gameService.rematch(gameId, playerId)
        return redirect(`/games/${newGameId}`)

      default:
        game = null
        break
    }

    if (!game) {
      return new Response('Game not found', { status: 404 })
    }

    return Response.json({ game: prepareGameForClient(game, playerId) })
  } catch (error) {
    return new Response(error instanceof Error ? error.message : 'Internal Server Error', { status: 500 })
  }
}
