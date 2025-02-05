import { ActionFunction, redirect } from '@remix-run/node'
import { Form, useOutletContext } from '@remix-run/react'
import { useRef } from 'react'
import { Button } from '~/components/Button'
import { GameBoard } from '~/components/GameBoard'
import { GameTable } from '~/components/GameTable'
import { AppContext, GameStatus } from '~/types'

export const action: ActionFunction = async ({ params, request, context }) => {
  const { sessionService, socketService } = context as AppContext
  const { playerId } = await sessionService.getPlayerSession(request)
  if (!playerId) {
    return null
  }
  await socketService.startGame(params.gameId!, playerId)
  return redirect(`/game/${params.gameId}/in-progress`)
}

export default function GameWaiting() {
  const { playerId, hostId, status, pin } = useOutletContext<{
    playerId: string
    hostId: String
    status: GameStatus
    pin: string
  }>()
  const formRef = useRef<HTMLFormElement>(null)

  return (
    <>
      <div className='text-nord-6 text-xl p-2'>
        PIN: <strong>{pin}</strong>
      </div>
      {playerId === hostId && <Form method='post' className='flex-none' ref={formRef} />}
      <div className='flex-auto'>
        <GameTable
          playerId={playerId}
          status='WAITING'
          onStartGame={playerId === hostId ? () => formRef.current?.submit() : null}
        />
      </div>
    </>
  )
}
