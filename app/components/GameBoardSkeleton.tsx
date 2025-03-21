import React from 'react'
import { Sprite } from './Sprite'
import { PlayingCard } from './PlayingCard'
import { PlayerNameTag } from './PlayerNameTag'
import { Link } from '@remix-run/react'

interface GameBoardSkeletonProps extends React.PropsWithChildren {
  player?: Pick<React.ComponentProps<typeof PlayerNameTag>, 'id' | 'username'>
  isPlayerHandVisible?: boolean
}

const GameBoardSkeleton: React.FC<GameBoardSkeletonProps> = ({
  isPlayerHandVisible = true,
  player = { id: '', username: '᠁' },
  children = <Sprite id='spinner' color='nord-8' size={32} className='animate-spin' />
}) => {
  return (
    <div className='w-full h-full grid grid-cols-1 grid-rows-[auto_1fr_auto]'>
      <header className='relative z-40 flex items-center justify-between gap-2 bg-nord-0 p-1 pl-6'>
        <Link to='/'>
          <h1 className='text-3xl'>polar coup</h1>
        </Link>
      </header>
      <main className='flex items-center justify-center'>{children}</main>
      {isPlayerHandVisible ? (
        <section className='grid grid-rows-[auto_auto] px-4 pb-4 flex-none bg-nord-0 container-type-inline-size z-50'>
          <PlayerNameTag {...player} className='my-1.5' size='lg' bgColor='nord-0' coins={0} />

          <div className='h-[64cqi] grid items-center gap-4 grid-cols-2'>
            {Array.from({ length: 2 }).map((_, i) => {
              return <PlayingCard key={`card-${i}`} id={`card-${i}`} isFaceDown={true} isAnimated={false} type={null} />
            })}
          </div>
        </section>
      ) : (
        <section className='w-full h-[calc(69cqi+1rem)]' />
      )}
    </div>
  )
}

const GameBoardSkeletonMemo = React.memo(GameBoardSkeleton)

export { GameBoardSkeletonMemo as GameBoardSkeleton }
