import { ActionFunctionArgs, json } from '@remix-run/node'
import { gameService } from '~/services/index.server'

export async function action({ request, params }: ActionFunctionArgs) {
  if (request.method !== 'POST') {
    console.error('Method not allowed')
    return Response.error()
  }

  try {
    const { gameId } = params
    if (!gameId) {
      console.error('Missing required fields')
      return Response.error()
    }

    // Add a bot to the game
    const { botId } = await gameService.addBot(gameId)

    return Response.json({ success: true, botId })
  } catch (error) {
    console.error(error)
    return Response.error()
  }
}
