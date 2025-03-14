import React, { useState } from 'react'
import { Game } from '~/types'
import { Button } from './Button'
import { WaitingEllipsis } from './WaitingEllipsis'
import { PlayerNameTag } from './PlayerNameTag'
import { GameTableDialog } from './GameTableDialog'
import { useIsMobile } from '~/hooks/useIsMobile'
import classNames from 'classnames'
import { Form } from '@remix-run/react'

interface GameLobbyProps {
  game: Game<'client'>
  playerId: string
  addBot: () => Promise<void>
  isLoading: boolean
}

export const GameLobby: React.FC<GameLobbyProps> = ({
  playerId,
  game: { id: gameId, hostId, status, pin, players },
  addBot,
  isLoading
}) => {
  const isHost = playerId === hostId
  const canStart = players.length >= 2 && isHost

  const [shareButtonText, setShareButtonText] = useState<string | null>(null)
  const [wasPinCopied, setWasPinCopied] = useState(false)
  const isMobile = useIsMobile()

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
    <GameTableDialog
      heading='Game Lobby'
      actions={
        isHost
          ? {
              url: `/api/games/${gameId}/start?hostId=${playerId}`,
              variant: 'success',
              disabled: !canStart,
              children: 'Start Game'
            }
          : null
      }
    >
      <div className='ml-1 text-xs font-sansation text-nord-4 absolute top-2 right-6'>
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
      <div className='grid grid-cols-[auto_1fr_auto] items-center gap-2 mt-1 mb-6'>
        <Form action={`/api/games/${gameId}/leave?playerId=${playerId}`} method='POST'>
          <Button size='base' sprite='arrow-left' variant='danger' type='submit'>
            Leave
          </Button>
        </Form>
        <Button size='base' variant='primary' onClick={handleShare} sprite='link'>
          {shareButtonText || 'Invite Players'}
        </Button>
      </div>

      <div className='w-full max-w-md flex-auto flex flex-col'>
        <div
          className={classNames('flex items-center justify-between mb-2', {
            'mb-4': false
          })}
        >
          <h3 className='text-lg'>Players ({players.length})</h3>
          {isHost && (
            <Button
              size='sm'
              variant='secondary'
              onClick={addBot}
              disabled={players.length > 5}
              isLoading={isLoading}
              sprite='plus'
            >
              Bot Player
            </Button>
          )}
        </div>
        <ul className='list-reset pb-6 flex flex-col items-stretch flex-auto gap-2'>
          {players.map((player, i) => (
            <li key={player.id} className='w-full rounded-full px-4 pb-[2px] pt-[3px] bg-nord-15 text-base'>
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
        <div className='text-lg leading-16 sticky bottom-0 text-center pb-6 pt-4'>
          Waiting for host
          <WaitingEllipsis size='lg' />
        </div>
      )}
    </GameTableDialog>
  )
}
