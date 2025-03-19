import { CardType, type Game } from '~/types'
import { redirect, LoaderFunction, LinksFunction, defer } from '@remix-run/node'
import { Await, Outlet, useLoaderData, useNavigation } from '@remix-run/react'
import { CoupContextProvider, useCoupContext } from '~/context/CoupContext'
import { gameService, playerService, sessionService } from '~/services/index.server'
import { prepareGameForClient } from '~/utils/game'
import { GameBoard } from '~/components/GameBoard'
import { Header } from '~/components/Header'
import { Sprite } from '~/components/Sprite'
import { GameBoardSkeleton } from '~/components/GameBoardSkeleton'
import { Suspense } from 'react'

export const links: LinksFunction = () => {
  return Object.keys(CardType).map(character => ({
    rel: 'preload',
    as: 'image',
    href: `/images/${character.toLowerCase()}.png`
  }))
}

export const loader: LoaderFunction = async ({ request, params }) => {
  const { playerId } = await sessionService.requirePlayerSession(request)
  const { player } = await playerService.getPlayer(playerId)
  const gameId = params.gameId!

  if (player?.currentGameId && player.currentGameId !== gameId) {
    throw redirect(`/games/${player.currentGameId}`)
  }

  const gamePromise: Promise<Game<'client'>> = gameService.getGame(gameId).then(({ game }) => {
    const { players = [] } = game || {}
    const player = players.find(p => p.id === playerId)

    if (!game || !player) {
      return Promise.reject(new Error('Game not found'))
    }

    return prepareGameForClient(game, playerId)
  })

  return defer({
    playerId,
    gameId,
    game: gamePromise
  })
}

export default function GameRoute() {
  const isLoading = useNavigation().state !== 'idle'
  const { gameId, playerId, game } = useLoaderData<typeof loader>()

  if (isLoading) {
    return <GameBoardSkeleton />
  }

  return (
    <Suspense fallback={<GameBoardSkeleton />}>
      <Await resolve={game}>
        {game => (
          <CoupContextProvider gameId={gameId} playerId={playerId} game={game}>
            <GameBoard playerId={playerId} />
          </CoupContextProvider>
        )}
      </Await>
    </Suspense>
  )
}

export function ErrorBoundary() {
  return (
    <GameBoardSkeleton>
      <div className='mx-6 bg-nord-11 p-4 rounded-lg grid grid-cols-[auto_1fr] gap-4 delayed-fade-in'>
        <div className='flex items-center justify-center'>
          <Sprite id='exclamation' color='nord-6' size='sm' />
        </div>
        <span className='text-lg text-nord-6'>Game not found</span>
      </div>
    </GameBoardSkeleton>
  )
}
