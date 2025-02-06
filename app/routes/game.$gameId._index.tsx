import { LoaderFunction, redirect } from '@remix-run/node'
import { AppContext } from '~/types'

export const loader: LoaderFunction = async ({ request, context, params }) => {
  const { sessionService, gameService } = context as AppContext

  const { playerId } = await sessionService.requirePlayerSession(request)
  const gameId = params.gameId!
  const { game } = await gameService.getGame(gameId)

  if (!playerId || !game) {
    throw redirect('/')
  }

  switch (game.status) {
    case 'COMPLETED':
      return redirect('completed')
    case 'IN_PROGRESS':
      return redirect('in-progress')
    case 'WAITING':
      return redirect('waiting')
  }
}

export default function GameIndex() {
  return null
}
