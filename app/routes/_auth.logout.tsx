import { useEffect, useRef } from 'react'
import { Form } from '@remix-run/react'
import { ActionFunction, LoaderFunction, redirect } from '@remix-run/node'
import { sessionService, playerService } from '~/services/index.server'

export const loader: LoaderFunction = async ({ request }) => {
  const { playerId } = await sessionService.getPlayerSession(request)
  if (playerId) {
    await playerService.deletePlayer(playerId)
  }
  return { success: true }
}

export const action: ActionFunction = async ({ request }) => {
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
    <div className='flex flex-col pt-16 pb-8 px-6 h-full gap-12'>
      <Form ref={formRef} method='post' className='contents'>
        <h1 className='font-robotica text-7xl'>See ya</h1>
        <p className='text-xl font-medium'>Logging you out...</p>
      </Form>
    </div>
  )
}
