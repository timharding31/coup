import { ActionFunction, LoaderFunction } from '@remix-run/node'
import { Form, Link, useActionData, useLoaderData } from '@remix-run/react'
import { Button } from '~/components/Button'
import { Header } from '~/components/Header'
import { TextInput } from '~/components/TextInput'
import { playerService, sessionService } from '~/services/index.server'

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

  // Check if username is taken by another user
  const existingUser = await playerService.getPlayerByUsername(username)
  if (existingUser.playerId && existingUser.playerId !== playerId) {
    return { error: 'Username already exists' }
  }

  await playerService.updatePlayer(playerId, { username })
  return { success: true }
}

export default function Settings() {
  const { username } = useLoaderData<{ username: string; currentGameId?: string }>()
  const { error: errorMessage, success } = useActionData<{ error?: string; success?: boolean }>() || {}

  return (
    <>
      <Header backButton={'/'} showIdentityPopoverTrigger={false} />
      <div className='mt-16 px-6'>
        <h1 className='font-robotica text-5xl'>Settings</h1>
        <Form method='post' className='mt-12 flex flex-col items-stretch gap-6 w-full'>
          <TextInput
            name='username'
            label='Username'
            defaultValue={username}
            required
            size='lg'
            errorMessage={errorMessage}
          />
          <Button variant='primary' type='submit' size='lg' sprite={success ? 'check' : undefined}>
            {success ? 'Saved' : 'Save'}
          </Button>
        </Form>
      </div>
    </>
  )
}
