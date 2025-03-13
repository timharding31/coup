import { LoaderFunction, redirect, type ActionFunction } from '@remix-run/node'
import { gameService } from '~/services/index.server'
import { prepareGameForClient } from '~/utils/game'

export const loader: LoaderFunction = async ({ params }) => {
  const { gameId } = params
  return redirect(`/games/${gameId}`)
}

export const action: ActionFunction = async ({ request, params }) => {
  if (request.method !== 'POST') {
    console.error('Method not allowed')
    return Response.error()
  }

  try {
    const { gameId } = params
    const hostId = new URL(request.url).searchParams.get('hostId')

    if (!gameId || !hostId) {
      console.error('Missing gameId or hostId')
      return Response.error()
    }

    const { game } = await gameService.startGame(gameId, hostId)

    return Response.json({
      game: game ? prepareGameForClient(game, hostId) : null
    })
  } catch (error) {
    console.error(error)
    return Response.error()
  }
}
