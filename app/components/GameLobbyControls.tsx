import React, { useCallback } from 'react'
import { Game } from '~/types'
import { Button } from './Button'
import { useCoupContext } from '~/context/CoupContext'

interface GameLobbyControlsProps {
  game: Game<'client'>
  playerId: string
}

export const GameLobbyControls: React.FC<GameLobbyControlsProps> = ({
  game: { hostId, status, pin, players },
  playerId
}) => {
  const { startGame } = useCoupContext()
  if (status !== 'WAITING') {
    return null
  }

  const isHost = playerId === hostId
  const canStart = players.length >= 2 && isHost

  const handleShare = async () => {
    const shareLink = `/games/join/${pin}`
    const fullUrl = `${window.location.origin}${shareLink}`

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join my Coup game!',
          text: `Join my game with PIN: ${pin}`,
          url: fullUrl
        })
      } catch (err) {
        await navigator.clipboard.writeText(fullUrl)
      }
    } else {
      await navigator.clipboard.writeText(fullUrl)
    }
  }

  return (
    <div className='absolute top-0 right-0 bottom-0 left-0 bg-nord-0/50 p-2'>
      <div className='flex flex-col w-full h-full p-6 bg-ui rounded-xl nord-shadow overflow-y-scroll ring-nord-0 ring-1'>
        <div className='flex flex-col items-stretch flex-1'>
          <div className='flex items-end justify-between gap-2 flex-wrap'>
            <h2 className='text-2xl'>Lobby</h2>
            <p className='text-sm text-right font-bold text-nord-4'>PIN: {pin}</p>
          </div>

          <Button size='sm' variant='primary' onClick={handleShare} sprite='arrow' className='mt-3 mb-6'>
            Share Game Link
          </Button>

          <div className='w-full max-w-md flex-auto'>
            <h3 className='text-lg mb-2'>Players ({players.length})</h3>
            <ul className='list-reset space-y-2'>
              {new Array(6).fill(players[0]).map((player, i) => (
                <li
                  key={`${player.id}-${i}`}
                  className='px-4 py-1 bg-nord-1 rounded-lg flex items-center justify-between'
                >
                  <div className='font-bold text-sm'>
                    <span className='mr-2'>&bull;</span>
                    {player.username.toUpperCase()}
                  </div>
                  {player.id === hostId && <span className='text-xs text-nord-8'>(host)</span>}
                </li>
              ))}
            </ul>
          </div>

          {isHost && (
            <Button size='lg' variant='success' onClick={startGame} disabled={!canStart} className='mt-6'>
              Start Game
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
