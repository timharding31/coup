import type { Game } from '~/types'
import { redirect, LoaderFunction } from '@remix-run/node'
import { Outlet, useLoaderData } from '@remix-run/react'
import { CoupContextProvider } from '~/context/CoupContext'
import { gameService, sessionService } from '~/services/index.server'
import { prepareGameForClient } from '~/utils/game'
import { GameBoard } from '~/components/GameBoard'

export const loader: LoaderFunction = async ({ request, context, params }) => {
  const { playerId } = await sessionService.requirePlayerSession(request)
  const gameId = params.gameId!
  const { game } = await gameService.getGame(gameId)

  if (!game) {
    throw redirect('/')
  }

  return { gameId, playerId, game: prepareGameForClient(game, playerId) }
}

export default function GameRoute() {
  const { gameId, playerId, game } = useLoaderData<{
    gameId: string
    playerId: string
    game: Game<'client'>
  }>()

  return (
    <CoupContextProvider gameId={gameId} playerId={playerId} game={game}>
      <div className='h-full w-full flex flex-col items-stretch justify-between'>
        <GameBoard playerId={playerId} />
      </div>
    </CoupContextProvider>
  )
}
