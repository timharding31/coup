import { redirect, type ActionFunction, type LoaderFunction, type MetaFunction } from '@remix-run/node'
import { Form, Link, useActionData, useLoaderData } from '@remix-run/react'
import { useState } from 'react'
import { Button } from '~/components/Button'
import { IdentityPopover } from '~/components/IdentityPopover'
import { PinInput } from '~/components/PinInput'
import { PlayingCard } from '~/components/PlayingCard'
import { TextInput } from '~/components/TextInput'
import { gameService, playerService, sessionService } from '~/services/index.server'
import { Card, CardType, Player } from '~/types'

export const loader: LoaderFunction = async ({ request }) => {
  const { playerId } = await sessionService.requirePlayerSession(request)
  const { player } = await playerService.getPlayer(playerId)
  if (!player?.username) {
    throw redirect('/logout')
  }
  return { player }
}

export const action: ActionFunction = async ({ request }) => {
  const { playerId } = await sessionService.getPlayerSession(request)

  if (!playerId) {
    return { error: 'Player not found' }
  }

  const formData = await request.formData()

  const intent = formData.get('intent')?.toString()
  const pin = formData.get('pin')?.toString()

  let gameId: string | null = null

  switch (intent) {
    case 'create':
      try {
        gameId = (await gameService.createGame(playerId)).gameId
      } catch (e) {
        return { error: 'Something went wrong, please try again' }
      }
      break

    case 'join':
      if (!pin) {
        return { error: 'PIN is required' }
      }
      try {
        gameId = (await gameService.joinGameByPin(playerId, pin.toString())).gameId
      } catch (e) {
        return { error: 'Invalid PIN' }
      }
      break
  }

  if (gameId) {
    return redirect(`/games/${gameId}`)
  }

  return { error: 'Something went wrong, please try again' }
}

export default function Index() {
  const { player } = useLoaderData<{ player: Player }>()
  const { error: errorMessage } = useActionData<{ error?: string }>() || {}
  const [pin, setPin] = useState('')

  return (
    <div className='pt-16 pb-8 px-6 flex flex-col h-full'>
      <header className='fixed top-0 left-max right-max p-1 flex'>
        <div className='ml-auto'>
          <IdentityPopover {...player} buttonProps={{ variant: 'secondary' }} />
        </div>
      </header>

      <h1 className='font-robotica text-7xl'>coup</h1>

      <div className='flex flex-col items-stretch mt-16 gap-6 w-full'>
        <Form method='post' className='contents'>
          <input type='hidden' name='intent' value='create' />
          <Button variant='primary' type='submit' size='lg'>
            Create New Game
          </Button>
        </Form>

        <div className='text-nord-4 text-center text-base'>— or —</div>

        <Form method='post'>
          <input type='hidden' name='intent' value='join' />
          <div className='flex flex-col items-stretch gap-2'>
            <PinInput name='pin' value={pin} onChange={setPin} required errorMessage={errorMessage} />
            <Button variant='secondary' type='submit' size='lg'>
              Join by PIN
            </Button>
          </div>
        </Form>
      </div>
    </div>
  )
}
