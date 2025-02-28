import { ActionFunctionArgs, json } from '@remix-run/node'
import { gameService } from '~/services/index.server'

export async function action({ request, params }: ActionFunctionArgs) {
  const { gameId } = params
  if (!gameId) {
    return Response.error()
  }

  try {
    // Check the request method
    if (request.method === 'POST') {
      // Add a bot to the game
      const { botId } = await gameService.addBot(gameId)

      return Response.json({ success: true, botId })
    }
    return Response.error()
  } catch (error) {
    console.error('Error adding bot:', error)
    return Response.error()
  }
}
