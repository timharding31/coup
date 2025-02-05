import type { AppContext, Game } from '~/types'
import { redirect, LoaderFunction } from '@remix-run/node'
import { Outlet, useLoaderData } from '@remix-run/react'
import { GameSocketProvider } from '~/context/GameSocket'
import { prepareGameForClient } from '~/services/socket.server'

export const loader: LoaderFunction = async ({ request, context, params }) => {
  const { sessionService, gameService } = context as AppContext

  const { playerId } = await sessionService.requirePlayerSession(request)
  const gameId = params.gameId!
  const { game } = await gameService.getGame(gameId)

  if (!game) {
    throw redirect('/')
  }

  const socketUrl = process.env.SOCKET_URL || 'http://localhost:3000'

  return { gameId, playerId, socketUrl, game: prepareGameForClient(game, playerId) }
}

export default function GameRoute() {
  const { gameId, playerId, socketUrl, game } = useLoaderData<{
    gameId: string
    playerId: string
    socketUrl: string
    game: Game
  }>()

  return (
    <GameSocketProvider gameId={gameId} playerId={playerId} socketUrl={socketUrl} game={game}>
      <div className='fixed top-0 bottom-0 left-[50%] w-full max-w-[480px] translate-x-[-50%] flex flex-col items-stretch justify-between'>
        <Outlet context={{ playerId, hostId: game.hostId, status: game.status, pin: game.pin }} />
      </div>
      {/* <GameSocketContext.Consumer>
        {value =>
          value?.game ? (
            <div>
              Game:
              <pre>{JSON.stringify(value.game, null, 2)}</pre>
            </div>
          ) : null
        }
      </GameSocketContext.Consumer> */}
    </GameSocketProvider>
  )
}
