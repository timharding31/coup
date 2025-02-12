import { redirect, type ActionFunction, type LoaderFunction, type MetaFunction } from '@remix-run/node'
import { Form, Link, useLoaderData } from '@remix-run/react'
import { useState } from 'react'
import { Button } from '~/components/Button'
import { PinInput } from '~/components/PinInput'
import { PlayingCard } from '~/components/PlayingCard'
import { TextInput } from '~/components/TextInput'
import { gameService, playerService, sessionService } from '~/services/index.server'
import { Card, CardType, Player } from '~/types'

export const meta: MetaFunction = () => {
  return [{ title: '' }, { name: 'description', content: '' }]
}

export const loader: LoaderFunction = async ({ request }) => {
  const { playerId } = await sessionService.requirePlayerSession(request)
  const { player } = await playerService.getPlayer(playerId)
  if (!player?.username) {
    throw redirect('/logout')
  }
  return { player }
}

export const action: ActionFunction = async ({ request, context }) => {
  const { playerId } = await sessionService.getPlayerSession(request)

  if (!playerId) {
    return null
  }

  const formData = await request.formData()
  const intent = formData.get('intent')
  let pin = ''
  let gameId: string | null = null

  switch (intent) {
    case 'create':
      gameId = (await gameService.createGame(playerId)).gameId
      break

    case 'join':
      pin = formData.get('pin')?.toString() || ''
      if (!pin) {
        return { error: 'PIN is required' }
      }
      gameId = (await gameService.joinGameByPin(playerId, pin.toString())).gameId
      break
  }

  if (gameId) {
    return redirect(`/games/${gameId}`)
  }

  return null
}

export default function Index() {
  const { player } = useLoaderData<{ player: Player }>()
  const [pin, setPin] = useState('')

  return (
    <div className='pt-16 pb-8 px-12 flex flex-col h-full'>
      <h1 className='font-robotica text-7xl'>coup</h1>

      <p className='mt-12 text-xl font-medium'>Welcome, {player?.username}</p>

      <div className='flex flex-col items-stretch mt-8 gap-4 w-full'>
        <Form method='post' className='contents'>
          <input type='hidden' name='intent' value='create' />
          <Button variant='secondary' type='submit'>
            Create new game
          </Button>
        </Form>

        <div className='text-nord-4 text-center text-base'>— or —</div>

        <Form method='post'>
          <input type='hidden' name='intent' value='join' />
          <div className='flex flex-col items-stretch gap-2'>
            <PinInput name='pin' value={pin} onChange={setPin} required />
            <Button variant='primary' type='submit'>
              Join by PIN
            </Button>
          </div>
        </Form>
      </div>

      <Link to='/logout' className='mt-auto underline text-lg'>
        Logout
      </Link>
    </div>
  )
}
