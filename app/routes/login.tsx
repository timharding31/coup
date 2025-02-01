import { ActionFunction, LoaderFunction, redirect } from '@remix-run/node'
import { Form } from '@remix-run/react'

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
    <div>
      <h1>Login</h1>
      <Form method='post'>
        <input type='text' name='username' placeholder='Enter your username' required />
        <button type='submit'>Login</button>
      </Form>
    </div>
  )
}
