import { ActionFunction, LoaderFunction } from '@remix-run/node'
import { Form, Link, useActionData, useLoaderData, useNavigate } from '@remix-run/react'
import { useRef, useState } from 'react'
import { Button } from '~/components/Button'
import { Header } from '~/components/Header'
import { TextInput } from '~/components/TextInput'
import { gameService, playerService, sessionService } from '~/services/index.server'
import { prepareOpponentForPlayer } from '~/utils/game'

export const loader: LoaderFunction = async ({ request }) => {
  const { playerId } = await sessionService.requirePlayerSession(request)
  const { player } = await playerService.getPlayer(playerId)

  if (!player) {
    throw new Error('Player not found')
  }

  return player
}

export const action: ActionFunction = async ({ request }) => {
  const { playerId } = await sessionService.requirePlayerSession(request)
  const formData = await request.formData()
  const username = formData.get('username')?.toString()

  if (!username) {
    return { error: 'Username is required' }
  }

  const { player } = await gameService.updatePlayer(playerId, { username })
  return { success: !!player }
}

export default function Settings() {
  const navigate = useNavigate()
  const [isBackButtonDisabled, setIsBackButtonDisabled] = useState(false)
  const { username } = useLoaderData<{ username: string; currentGameId?: string }>()
  const { error: errorMessage, success } = useActionData<{ error?: string; success?: boolean }>() || {}

  return (
    <>
      <Header />
      <div className='mt-16 px-6'>
        <h1 className='font-robotica text-4xl'>Settings</h1>
        <Form method='post' className='mt-12 flex flex-col items-stretch gap-6 w-full'>
          <TextInput
            name='username'
            label='Username'
            defaultValue={username}
            required
            size='lg'
            errorMessage={errorMessage}
            onBlur={e => {
              setIsBackButtonDisabled(e.target.value !== username)
            }}
          />
          <div className='grid grid-cols-[auto_1fr] gap-2'>
            <Button
              variant='secondary'
              type='button'
              size='base'
              onClick={() => navigate(-1)}
              sprite='arrow-left'
              disabled={isBackButtonDisabled && !success}
            >
              Back
            </Button>
            <Button variant='primary' type='submit' size='base' sprite={success ? 'check' : undefined}>
              {success ? 'Saved' : 'Save'}
            </Button>
          </div>
        </Form>
      </div>
    </>
  )
}
