import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Game } from '~/types'
import { Button } from './Button'
import { useCoupContext } from '~/context/CoupContext'
import { Link, useNavigate } from '@remix-run/react'
import { WaitingEllipsis } from './WaitingEllipsis'
import { PlayerNameTag } from './PlayerNameTag'
import { GameTableOverlay } from './GameTableOverlay'
import { useIsMobile } from '~/hooks/useIsMobile'

interface GameLobbyProps {
  game: Game<'client'>
  playerId: string
  startGame: () => Promise<void>
  leaveGame: () => Promise<void>
}

export const GameLobby: React.FC<GameLobbyProps> = ({
  game: { hostId, status, pin, players },
  playerId,
  startGame,
  leaveGame
}) => {
  const isHost = playerId === hostId
  const canStart = players.length >= 2 && isHost

  const [shareButtonText, setShareButtonText] = useState<string | null>(null)
  const [wasPinCopied, setWasPinCopied] = useState(false)
  const isMobile = useIsMobile()
  const navigate = useNavigate()

  if (status !== 'WAITING') {
    return null
  }

  const handleShare = async () => {
    const shareLink = `/games/join/${pin}`
    const fullUrl = `${window.location.origin}${shareLink}`

    const handleCopy = () =>
      navigator.clipboard.writeText(fullUrl).then(() => {
        setShareButtonText('Copied')
        setTimeout(() => setShareButtonText(null), 2_000)
      })

    if (isMobile && navigator.share) {
      try {
        await navigator.share({
          text: 'Join my Coup game!',
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
    <GameTableOverlay
      heading='Game Lobby'
      buttonProps={
        isHost ? { variant: 'success', onClick: startGame, disabled: !canStart, children: 'Start Game' } : null
      }
    >
      <div className='ml-1 text-xs font-sansation text-nord-4 absolute top-0 right-4'>
        <span
          onClick={() => {
            navigator.clipboard.writeText(pin).then(() => {
              if (!isMobile) {
                setWasPinCopied(true)
                setTimeout(() => setWasPinCopied(false), 2_000)
              }
            })
          }}
        >
          PIN: <strong className='text-nord-6 text-base tracking-wider'>{pin}</strong>
        </span>
        {wasPinCopied && (
          <div className='tooltip-content absolute -left-10 right-0 text-center top-[100%] text-sm rounded-md bg-nord-8 text-nord-0 z-50'>
            Copied {pin}
          </div>
        )}
      </div>
      <div className='grid grid-cols-[auto_1fr] items-center gap-2 mt-1 mb-6'>
        <Button
          size='sm'
          sprite='arrow-left'
          variant='danger'
          onClick={() => {
            leaveGame().then(() => navigate('/'))
          }}
        >
          Leave
        </Button>
        <Button size='sm' variant='primary' onClick={handleShare} sprite='link'>
          {shareButtonText || 'Invite Players'}
        </Button>
      </div>

      <div className='w-full max-w-md flex-auto'>
        <h3 className='text-lg mb-2'>Players ({players.length})</h3>
        <ul className='list-reset space-y-2 pb-6'>
          {players.map((player, i) => (
            <li key={player.id} className='inline-flex w-full rounded-full px-2 pb-[2px] pt-[3px] bg-nord-15 text-base'>
              <span className='mr-2 pl-1 text-nord-1'>&bull;</span>
              <PlayerNameTag
                {...player}
                isHost={player.id === hostId}
                cardCount={2}
                coins={2}
                textColor='nord-0'
                bgColor='nord-0'
              />
            </li>
          ))}
        </ul>
      </div>

      {!isHost && (
        <div className='text-lg leading-16 sticky bottom-0 text-center bg-ui pb-6 pt-4'>
          Waiting for host
          <WaitingEllipsis size='lg' />
        </div>
      )}
    </GameTableOverlay>
  )
}
