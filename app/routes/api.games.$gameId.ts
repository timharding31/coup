import { ActionFunction, LoaderFunction, redirect } from '@remix-run/node'
import { gameService } from '~/services/index.server'
import { Game } from '~/types'
import { CoupRequest, CoupRequestIntent } from '~/types/request'
import { prepareGameForClient } from '~/utils/game'

export const loader: LoaderFunction = async ({ params }) => {
  return redirect(`/games/${params.gameId}`)
}

export const action: ActionFunction = async ({ request, params }) => {
  const gameId = params.gameId!

  if (request.method !== 'POST') {
    console.error('Method not allowed')
    throw redirect(`/games/${gameId}`)
  }

  try {
    const { intent, playerId, ...rest } = (await request.json()) as Partial<CoupRequest>

    let game: Game<'server'> | null = null

    switch (intent) {
      case CoupRequestIntent.START_TURN:
        const { action } = rest
        if (!action || !playerId) {
          console.error('Missing required fields')
          throw redirect(`/games/${gameId}`)
        }
        game = (await gameService.startGameTurn(gameId, action)).game
        break

      case CoupRequestIntent.RESPOND_TO_ACTION:
        const { response, blockCard } = rest
        if (!response || !playerId || (response === 'block' && !blockCard)) {
          console.error('Missing required fields')
          throw redirect(`/games/${gameId}`)
        }
        game = (await gameService.handleResponse(gameId, playerId, response, blockCard)).game
        break

      case CoupRequestIntent.SELECT_CARD:
        const { cardId } = rest
        if (!cardId || !playerId) {
          console.error('Missing required fields')
          throw redirect(`/games/${gameId}`)
        }
        game = (await gameService.handleCardSelection(gameId, playerId, cardId)).game
        break

      case CoupRequestIntent.RETURN_CARDS:
        const { cardIds } = rest
        if (!cardIds?.length || !playerId) {
          console.error('Missing required fields')
          throw redirect(`/games/${gameId}`)
        }
        game = (await gameService.handleExchangeReturn(gameId, playerId, cardIds)).game
        break

      default:
        console.error('Invalid intent')
        throw redirect(`/games/${gameId}`)
    }

    return Response.json({ game: game ? prepareGameForClient(game, playerId) : null })
  } catch (err) {
    console.error(err)
    throw redirect(`/games/${gameId}`)
  }
}
