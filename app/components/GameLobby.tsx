import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Game } from '~/types'
import { Button } from './Button'
import { useCoupContext } from '~/context/CoupContext'

interface GameLobbyProps {
  game: Game<'client'>
  playerId: string
}

export const GameLobby: React.FC<GameLobbyProps> = ({ game: { hostId, status, pin, players }, playerId }) => {
  const { startGame } = useCoupContext()

  const isHost = playerId === hostId
  const canStart = players.length >= 2 && isHost

  const [shareButtonText, setShareButtonText] = useState<string | null>(null)

  const [waitingCursor, setWaitingCursor] = useState(0)

  useEffect(() => {
    if (status !== 'WAITING' || isHost) {
      return
    }
    const interval = setInterval(() => {
      setWaitingCursor(prev => (prev + 1) % 4)
    }, 500)
    return () => clearInterval(interval)
  }, [status, isHost])

  if (status !== 'WAITING') {
    return null
  }

  const handleShare = async () => {
    const shareLink = `/games/join/${pin}`
    const fullUrl = `${window.location.origin}${shareLink}`

    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0

    const handleCopy = () =>
      navigator.clipboard.writeText(fullUrl).then(() => {
        setShareButtonText('Copied')
        setTimeout(() => setShareButtonText(null), 2_000)
      })

    if (isTouchDevice && navigator.share) {
      try {
        await navigator.share({
          title: 'Join my Coup game!',
          text: `Join my game with PIN: ${pin}`,
          url: fullUrl
        })
      } catch (err) {
        await handleCopy()
      }
    } else {
      await handleCopy()
    }
  }

  return (
    <div className='absolute top-0 right-0 bottom-0 left-0 bg-nord-0/50 p-2'>
      <div className='flex flex-col w-full h-full p-6 bg-ui rounded-xl nord-shadow overflow-y-scroll no-scrollbar ring-nord-0 ring-1 relative'>
        <div className='flex flex-col items-stretch flex-1'>
          <div className='flex items-baseline justify-between gap-2 flex-wrap'>
            <h2 className='text-2xl'>Lobby</h2>
            <p className='text-sm text-right text-nord-4'>
              pin: <strong>{pin}</strong>
            </p>
          </div>

          <Button size='sm' variant='primary' onClick={handleShare} sprite='link' className='mt-2 mb-6'>
            {shareButtonText || 'Share Game Link'}
          </Button>

          <div className='w-full max-w-md flex-auto'>
            <h3 className='text-lg mb-2'>Players ({players.length})</h3>
            <ol className='list-reset space-y-2 pb-6'>
              {players.map(player => (
                <li key={player.id} className='px-4 py-1 bg-nord-15 rounded-md flex items-center justify-between'>
                  <div className='font-bold text-sm text-nord--1'>
                    <span className='mr-2'>&bull;</span>
                    {player.username}
                  </div>
                  {player.id === hostId && <span className='text-xs text-nord-1'>host</span>}
                </li>
              ))}
            </ol>
          </div>

          {isHost ? (
            <Button size='lg' variant='success' onClick={startGame} disabled={!canStart} className='sticky bottom-0'>
              Start Game
            </Button>
          ) : (
            <div className='text-lg leading-16 sticky bottom-0 text-center'>
              Waiting for host to start game
              <span className='text-left inline-block w-[20px]'>{'...'.slice(0, waitingCursor)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
