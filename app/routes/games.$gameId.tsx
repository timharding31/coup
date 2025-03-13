import type { Game } from '~/types'
import { redirect, LoaderFunction } from '@remix-run/node'
import { Outlet, useLoaderData } from '@remix-run/react'
import { CoupContextProvider, useCoupContext } from '~/context/CoupContext'
import { gameService, sessionService } from '~/services/index.server'
import { prepareGameForClient } from '~/utils/game'
import { GameBoard } from '~/components/GameBoard'
import { Header } from '~/components/Header'
import { Sprite } from '~/components/Sprite'

export const loader: LoaderFunction = async ({ request, params }) => {
  const { playerId } = await sessionService.requirePlayerSession(request)
  const gameId = params.gameId!
  const { game } = await gameService.getGame(gameId)

  if (!game || !game.players?.find(p => p.id === playerId)) {
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
      <GameBoard playerId={playerId} />
    </CoupContextProvider>
  )
}

export function ErrorBoundary() {
  return (
    <>
      <Header />
      <div className='mt-40 mx-6 bg-nord-11 p-4 rounded-lg grid grid-cols-[auto_1fr] gap-4 delayed-fade-in'>
        <div className='flex items-center justify-center'>
          <Sprite id='exclamation' color='nord-6' size='sm' />
        </div>
        <span className='text-lg text-nord-6'>Game not found</span>
      </div>
    </>
  )
}
