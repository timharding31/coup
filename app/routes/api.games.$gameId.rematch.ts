import { LoaderFunction, redirect, type ActionFunction } from '@remix-run/node'
import { gameService } from '~/services/index.server'

export const action: ActionFunction = async ({ request, params }) => {
  if (request.method !== 'POST') {
    console.error('Method not allowed')
    return Response.error()
  }

  try {
    const { gameId } = params
    let { hostId } = (await request.json()) || {}
    if (!hostId) {
      hostId = new URL(request.url).searchParams.get('hostId')
    }

    if (!gameId || !hostId) {
      console.error('Missing gameId or hostId')
      return Response.error()
    }
    const { newGameId } = await gameService.rematch(gameId, hostId)
    return Response.json({ newGameId })
  } catch (error) {
    console.error(error)
    return Response.error()
  }
}
