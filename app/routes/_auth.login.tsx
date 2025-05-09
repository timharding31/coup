import { ActionFunction, LoaderFunction, redirect } from '@remix-run/node'
import { Form, useActionData, useSearchParams } from '@remix-run/react'
import { Button } from '~/components/Button'
import { TextInput } from '~/components/TextInput'
import { playerService, sessionService } from '~/services/index.server'

export const loader: LoaderFunction = async ({ request }) => {
  const { playerId } = await sessionService.getPlayerSession(request)
  // Redirect to home if already logged in
  if (playerId) {
    throw redirect('/')
  }
  return { playerId }
}

export const action: ActionFunction = async ({ request, context }) => {
  const formData = await request.formData()
  const username = formData.get('username')?.toString()

  if (!username) {
    return { error: 'Username is required' }
  }

  // Create new user
  const { playerId } = await playerService.createPlayer(username)

  // Create session
  const cookie = await sessionService.createUserSession(playerId)

  const nextUrl = formData.get('then')?.toString() || '/'

  return redirect(nextUrl, {
    headers: {
      'Set-Cookie': cookie
    }
  })
}

export default function Login() {
  const { error: errorMessage } = useActionData<{ error?: string }>() || {}
  const [searchParams] = useSearchParams()
  const nextUrl = searchParams.get('then') || null
  return (
    <div className='pt-16 px-6'>
      <h1 className='font-robotica text-6xl'>polar coup</h1>
      <Form method='post' className='mt-12 flex flex-col items-stretch gap-4 w-full'>
        {nextUrl && <input type='hidden' name='then' value={nextUrl} />}
        <TextInput name='username' placeholder='Enter your username' required size='lg' errorMessage={errorMessage} />
        <Button variant='secondary' type='submit' size='lg'>
          Continue
        </Button>
      </Form>
    </div>
  )
}
