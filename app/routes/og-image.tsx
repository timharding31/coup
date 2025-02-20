import { PlayingCard } from '~/components/PlayingCard'
import { CardType } from '~/types'

export default function OGImage() {
  return (
    <div className='bg-white fixed inset-0 h-screen w-screen flex items-center justify-center'>
      <div className='flex flex-col items-stretch justify-center bg-nord-1 py-8 px-12 aspect-[1200/630] w-[80%] gap-8'>
        <h1 className='text-center text-8xl'>polar coup</h1>
        <div className='grid grid-cols-5 gap-4 items-center'>
          {new Array<CardType>('DUKE', 'CAPTAIN', 'ASSASSIN', 'CONTESSA', 'AMBASSADOR').map((character, i) => (
            <PlayingCard key={character} type={character} id={`card-${i}`} />
          ))}
        </div>
      </div>
    </div>
  )
}
