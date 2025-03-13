import { LoaderFunction, redirect, type ActionFunction } from '@remix-run/node'
import { gameService } from '~/services/index.server'
import { prepareGameForClient } from '~/utils/game'

export const loader: LoaderFunction = async () => {
  return redirect('/')
}

export const action: ActionFunction = async ({ request, params }) => {
  if (request.method !== 'POST') {
    console.error('Method not allowed')
    return Response.error()
  }

  try {
    const { gameId } = params
    const playerId = new URL(request.url).searchParams.get('playerId')

    if (!gameId || !playerId) {
      console.error('Missing required fields')
      return Response.error()
    }

    const { success } = await gameService.leaveGame(playerId, gameId)

    return Response.json({ success })
  } catch (error) {
    console.error(error)
    return Response.error()
  }
}
