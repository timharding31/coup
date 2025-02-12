import { LoaderFunction, redirect } from '@remix-run/node'
import { gameService, sessionService } from '~/services/index.server'

export const loader: LoaderFunction = async ({ request, params }) => {
  const { playerId } = await sessionService.getPlayerSession(request)
  if (playerId) {
    // Player is logged in, they can join the game
    const { gameId } = await gameService.joinGameByPin(playerId, params.pin!)
    return redirect(`/games/${gameId}`)
  }
  // Otherwise, redirect them to the login page before coming back here
  return redirect(`/login?then=/games/join/${params.pin!}`)
}
