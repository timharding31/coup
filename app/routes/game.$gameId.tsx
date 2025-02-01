import { type AppContext } from '~/types'
import { type LoaderFunction } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { GameSocketContext, GameSocketProvider } from '~/context/GameSocket'
import { GameBoard } from '~/components/GameBoard'

export const loader: LoaderFunction = async ({ request, context, params }) => {
  const { sessionService, gameService } = context as AppContext

  const { playerId } = await sessionService.requirePlayerSession(request)
  const gameId = params.gameId!
  const { game } = await gameService.getGame(gameId)

  const socketUrl = process.env.SOCKET_URL || 'http://localhost:3000'

  return { gameId, playerId, socketUrl, game }
}

export default function GameRoute() {
  const { gameId, playerId, socketUrl, game } = useLoaderData<typeof loader>()

  return (
    <GameSocketProvider gameId={gameId} playerId={playerId} socketUrl={socketUrl} game={game}>
      <GameBoard playerId={playerId} />
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
