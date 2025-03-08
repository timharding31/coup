import { LoaderFunction, redirect, type ActionFunction } from '@remix-run/node'
import { gameService } from '~/services/index.server'
import { prepareGameForClient } from '~/utils/game'

export const loader: LoaderFunction = async () => {
  return redirect('/')
}

export const action: ActionFunction = async ({ request, params }) => {
  if (request.method !== 'POST') {
    return { error: 'Method not allowed' }
  }

  try {
    const { gameId } = params
    const playerId = new URL(request.url).searchParams.get('playerId')

    if (!gameId || !playerId) {
      return { error: 'Missing required fields' }
    }

    const { success } = await gameService.leaveGame(playerId, gameId)

    return Response.json({ success })
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unknown error' }
  }
}
