import { redirect, type ActionFunction, type LoaderFunction, type MetaFunction } from '@remix-run/node'
import { Form } from '@remix-run/react'
import type { AppContext } from '~/types'

export const meta: MetaFunction = () => {
  return [{ title: '' }, { name: 'description', content: '' }]
}

export const loader: LoaderFunction = async ({ request, context }) => {
  const { sessionService } = context as AppContext
  const { playerId } = await sessionService.requirePlayerSession(request)
  return { playerId }
}

export const action: ActionFunction = async ({ request, context }) => {
  const { sessionService, gameService } = context as AppContext
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
    return redirect(`/game/${gameId}`)
  }

  return null
}

export default function Index() {
  return (
    <div>
      <Form method='post'>
        <input type='hidden' name='intent' value='create' />
        <button type='submit'>Create new game</button>
      </Form>

      <Form method='post'>
        <input type='hidden' name='intent' value='join' />
        <div className='flex gap-2'>
          <input type='text' name='pin' placeholder='Enter game PIN' required />
          <button type='submit'>Join game</button>
        </div>
      </Form>
    </div>
  )
}
