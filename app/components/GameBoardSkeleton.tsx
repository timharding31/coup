import React from 'react'
import { Sprite } from './Sprite'
import { PlayingCard } from './PlayingCard'
import { PlayerNameTag } from './PlayerNameTag'

interface GameBoardSkeletonProps extends React.PropsWithChildren {
  isPlayerHandVisible?: boolean
}

const GameBoardSkeleton: React.FC<GameBoardSkeletonProps> = ({
  isPlayerHandVisible = true,
  children = <Sprite id='spinner' color='nord-8' size={32} className='animate-spin' />
}) => {
  return (
    <div className='w-full h-full grid grid-cols-1 grid-rows-[auto_1fr_auto]'>
      <header className='relative z-40 flex items-center justify-between gap-2 bg-nord-0 p-1 pl-6 border-b border-nord-3 nord-shadow'>
        <h1 className='text-3xl'>polar coup</h1>
      </header>
      <main className='flex items-center justify-center'>{children}</main>
      {isPlayerHandVisible ? (
        <section className='grid grid-rows-[auto_auto] px-4 pb-4 flex-none bg-nord-0 border-t border-nord-3 container-type-inline-size nord-shadow z-50'>
          <PlayerNameTag className='my-1.5' size='lg' bgColor='nord-0' id='' username='' coins={0} />

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
