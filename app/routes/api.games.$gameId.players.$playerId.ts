import type { ActionFunction } from '@remix-run/node'
import { gameService } from '~/services/index.server'
import { Player } from '~/types'

export const action: ActionFunction = async ({ request, params }) => {
  if (request.method !== 'POST') {
    console.error('Method not allowed')
    return Response.error()
  }

  try {
    const { gameId, playerId } = params
    const playerUpdates = (await request.json()) as Partial<Player>

    if (!gameId || !playerId) {
      console.error('Missing required fields')
      return Response.error()
    }

    const { player } = await gameService.updatePlayer(playerId, playerUpdates)
    return Response.json({ player })
  } catch (error) {
    console.error(error)
    return Response.error()
  }
}
