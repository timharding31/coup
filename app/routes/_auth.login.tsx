import { ActionFunction, LoaderFunction, redirect } from '@remix-run/node'
import { Form } from '@remix-run/react'
import { Button } from '~/components/Button'
import { TextInput } from '~/components/TextInput'

import type { AppContext } from '~/types/context'

export const loader: LoaderFunction = async ({ request, context }) => {
  const { sessionService } = context as AppContext
  const { playerId } = await sessionService.getPlayerSession(request)
  // Redirect to home if already logged in
  if (playerId) {
    return redirect('/')
  }
  return null
}

export const action: ActionFunction = async ({ request, context }) => {
  const { playerService, sessionService } = context as AppContext

  const formData = await request.formData()
  const username = formData.get('username')?.toString()

  if (!username) {
    return { error: 'Username is required' }
  }

  // Check if user exists
  const existingUser = await playerService.getPlayerByUsername(username)
  let playerId: string

  if (existingUser.playerId) {
    playerId = existingUser.playerId
  } else {
    // Create new user
    const newUser = await playerService.createPlayer(username)
    playerId = newUser.playerId
  }

  // Create session
  const cookie = await sessionService.createUserSession(playerId)
  return redirect('/', {
    headers: {
      'Set-Cookie': cookie
    }
  })
}

export default function Login() {
  return (
    <div className='flex flex-col items-stretch gap-2 w-full max-w-[800px] p-4 m-auto'>
      <Form method='post' className='contents'>
        <TextInput name='username' placeholder='Enter your username' required />
        <Button variant='secondary' type='submit'>
          Login
        </Button>
      </Form>
    </div>
  )
}
