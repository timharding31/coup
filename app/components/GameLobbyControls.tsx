import React, { useCallback } from 'react'
import { Game } from '~/types'
import { Button } from './Button'
import { useGameSocket } from '~/hooks/socket'

interface GameLobbyControlsProps {
  game: Game<'client'>
  playerId: string
}

export const GameLobbyControls: React.FC<GameLobbyControlsProps> = ({
  game: { hostId, status, pin, players },
  playerId
}) => {
  const { startGame } = useGameSocket()
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
          <div className='flex items-baseline justify-between gap-2 flex-wrap'>
            <h2 className='text-2xl'>Game Lobby</h2>
            <p className='text-sm text-right font-medium'>PIN: {pin}</p>
          </div>

          <div className='flex flex-col items-stretch gap-2 my-6'>
            <Button variant='primary' onClick={handleShare} sprite='arrow'>
              Share Game Link
            </Button>
            {isHost && (
              <Button variant='success' onClick={startGame} disabled={!canStart} sprite='check'>
                Start Game
              </Button>
            )}
          </div>

          <div className='w-full max-w-md'>
            <h3 className='text-base mb-2'>Players ({players.length})</h3>
            <ul className='list-reset space-y-2'>
              {players.map(player => (
                <li key={player.id} className='px-4 py-1 bg-nord-1 rounded-lg flex items-center justify-between'>
                  <div className='font-medium text-sm'>
                    <span className='mr-2'>&bull;</span>
                    {player.username}
                  </div>
                  {player.id === hostId && <span className='text-xs text-nord-8'>(host)</span>}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
