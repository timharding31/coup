import { ActionFunction, LoaderFunction, redirect } from '@remix-run/node'
import { Form } from '@remix-run/react'
import { Button } from '~/components/Button'
import { TextInput } from '~/components/TextInput'
import { playerService, sessionService } from '~/services/index.server'

export const loader: LoaderFunction = async ({ request, context }) => {
  const { playerId } = await sessionService.getPlayerSession(request)
  // Redirect to home if already logged in
  if (playerId) {
    return redirect('/')
  }
  return null
}

export const action: ActionFunction = async ({ request, context }) => {
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
    <div className='pt-16 px-12'>
      <h1 className='font-robotica text-7xl'>coup</h1>
      <Form method='post' className='mt-12 flex flex-col items-stretch gap-4 w-full'>
        <TextInput name='username' placeholder='Enter your username' required />
        <Button variant='secondary' type='submit'>
          Continue
        </Button>
      </Form>
    </div>
  )
}
