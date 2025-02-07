import { ActionFunction, LoaderFunction, redirect } from '@remix-run/node'
import { Form } from '@remix-run/react'
import { useEffect, useRef } from 'react'
import { Button } from '~/components/Button'
import { TextInput } from '~/components/TextInput'
import { sessionService, playerService } from '~/services/index.server'

export const loader: LoaderFunction = async ({ request, context }) => {
  const { playerId } = await sessionService.getPlayerSession(request)
  if (playerId) {
    await playerService.deletePlayer(playerId)
  }

  return null
}

export const action: ActionFunction = async ({ request, context }) => {
  // Remove session cookie on form submit
  const cookie = await sessionService.destroySession(request)

  return redirect('/', {
    headers: {
      'Set-Cookie': cookie
    }
  })
}

export default function Logout() {
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    const timout = setTimeout(() => {
      formRef.current?.submit()
    }, 2_000)
    return () => clearTimeout(timout)
  }, [])

  return (
    <div className='flex flex-col items-stretch gap-4 w-full max-w-[800px] py-24 px-4 mx-auto'>
      <Form ref={formRef} method='post' className='contents'>
        <h1 className='font-robotica text-7xl'>Goodbye</h1>
        <p className='text-xl'>Logging you out</p>
      </Form>
    </div>
  )
}
