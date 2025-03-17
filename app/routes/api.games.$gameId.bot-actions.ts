import { ActionFunctionArgs } from '@remix-run/node'
import { gameService, sessionService } from '~/services/index.server'
import { CoupRobot } from '~/services/robot.server'
import { Game, Player } from '~/types'
import { CardType } from '~/types/card'

type BotActionRequest = {
  botId: string | string[]
  action: 'turn' | 'respond' | 'block-response' | 'defense' | 'select-card' | 'exchange'
}

export async function action({ request, params }: ActionFunctionArgs) {
  if (request.method !== 'POST') {
    console.error('Method not allowed')
    return Response.error()
  }

  // Use the existing auth method
  await sessionService.requireAuth(request)

  const { gameId } = params
  await gameService.setBotActionInProgress(gameId!, true)
  try {
    const { botId, action } = (await request.json()) as BotActionRequest

    if (!gameId || !botId || !action) {
      console.error('Missing required fields')
      return Response.error()
    }

    // Get the game
    const { game } = await gameService.getGame(gameId)
    if (!game) {
      throw new Error('Game not found')
    }

    // Handle both single botId and array of botIds
    const botIds = Array.isArray(botId) ? botId : [botId]

    // Process based on action type
    switch (action) {
      case 'turn':
        await handleBotTurn(game, botIds[0]) // Only the first bot can take a turn
        break

      case 'respond':
        await handleBotActionResponses(game, botIds)
        break

      case 'block-response':
        await handleBotBlockResponse(game, botIds[0])
        break

      case 'defense':
        await handleBotDefense(game, botIds[0])
        break

      case 'select-card':
        await handleBotCardSelection(game, botIds[0])
        break

      case 'exchange':
        await handleBotExchangeReturn(game, botIds[0])
        break

      default:
        throw new Error(`Unknown action: ${action}`)
    }

    return Response.json({ success: true })
  } catch (error) {
    console.error('Error processing bot action:', error)
    return new Response(error instanceof Error ? error.message : 'Internal server error', { status: 500 })
  } finally {
    await gameService.setBotActionInProgress(gameId!, false)
  }
}

/**
 * Handle a bot's turn by choosing an action
 */
async function handleBotTurn(game: Game, botId: string): Promise<void> {
  // Get the bot
  const bot = game.players.find(p => p.id === botId)
  if (!bot || !CoupRobot.isBotPlayer(bot)) {
    throw new Error('Bot not found or not a bot')
  }

  // Create a robot instance for this bot
  const robot = await CoupRobot.create(bot, game)

  // Let the bot decide on an action
  const { action } = await robot.decideAction()

  // Start the turn with the bot's chosen action
  await gameService.startGameTurn(game.id, action)
}

/**
 * Handle bot action responses - optimized to handle multiple bots at once
 * and stop processing when one bot decides to block or challenge
 */
async function handleBotActionResponses(game: Game, botIds: string[]): Promise<void> {
  const currentTurn = game.currentTurn
  if (!currentTurn) return

  for (const botId of botIds) {
    // Get the bot player
    const bot = game.players.find(p => p.id === botId)
    if (!bot || !CoupRobot.isBotPlayer(bot)) {
      console.log(`Bot ${botId} not found or not a bot, skipping...`)
      continue
    }

    // Create a robot instance for this bot
    const robot = await CoupRobot.create(bot, game)

    // Let the bot decide how to respond
    const result = await robot.decideResponse()

    try {
      // Normal opponent response
      if (currentTurn.phase === 'AWAITING_OPPONENT_RESPONSES') {
        if (result.response === 'block') {
          await gameService.handleResponse(game.id, bot.id, 'block', result.blockCard)

          // Exit early after a block - changes the game phase
          return
        } else if (result.response === 'challenge') {
          await gameService.handleResponse(game.id, bot.id, 'challenge')

          // Exit early after a challenge - changes the game phase
          return
        } else {
          await gameService.handleResponse(game.id, bot.id, 'accept')
        }
      }
      // Target response to already challenged and defended action
      else if (currentTurn.phase === 'AWAITING_TARGET_BLOCK_RESPONSE') {
        if (result.response === 'block') {
          await gameService.handleResponse(game.id, bot.id, 'block', result.blockCard)
        } else {
          await gameService.handleResponse(game.id, bot.id, 'accept')
        }

        // Only one target can respond, so we can return after processing
        return
      }
    } catch (error) {
      console.error(`Error processing bot ${botId} response:`, error)
      // Continue with next bot if one fails
    }

    // Check if the game phase has changed
    const { game: updatedGame } = await gameService.getGame(game.id)
    if (updatedGame?.currentTurn?.phase !== currentTurn.phase) {
      // Phase has changed, stop processing more bots
      console.log(`Game phase changed to ${updatedGame?.currentTurn?.phase}, stopping bot processing`)
      return
    }
  }
}

/**
 * Handle bot response to a block
 */
async function handleBotBlockResponse(game: Game, botId: string): Promise<void> {
  const bot = game.players.find(p => p.id === botId)
  if (!bot || !CoupRobot.isBotPlayer(bot)) {
    throw new Error('Bot not found or not a bot')
  }

  const robot = await CoupRobot.create(bot, game)
  const { response } = await robot.decideResponse()

  // Handle the block response through gameService
  await gameService.handleResponse(game.id, botId, response === 'challenge' ? 'challenge' : 'accept')
}

/**
 * Handle bot defense against a challenge
 */
async function handleBotDefense(game: Game, botId: string): Promise<void> {
  const bot = game.players.find(p => p.id === botId)
  if (!bot || !CoupRobot.isBotPlayer(bot)) {
    throw new Error('Bot not found or not a bot')
  }

  const robot = await CoupRobot.create(bot, game)
  const { cardId } = await robot.decideCardSelection()

  // Use gameService for card selection
  await gameService.handleCardSelection(game.id, botId, cardId)
}

/**
 * Handle bot card selection
 */
async function handleBotCardSelection(game: Game, botId: string): Promise<void> {
  const bot = game.players.find(p => p.id === botId)
  if (!bot || !CoupRobot.isBotPlayer(bot)) {
    throw new Error('Bot not found or not a bot')
  }

  const robot = await CoupRobot.create(bot, game)
  const { cardId } = await robot.decideCardSelection()

  // Use gameService for card selection
  await gameService.handleCardSelection(game.id, botId, cardId)
}

/**
 * Handle bot exchange card selection
 */
async function handleBotExchangeReturn(game: Game, botId: string): Promise<void> {
  const bot = game.players.find(p => p.id === botId)
  if (!bot || !CoupRobot.isBotPlayer(bot)) {
    throw new Error('Bot not found or not a bot')
  }

  const robot = await CoupRobot.create(bot, game)
  const { cardIds } = await robot.decideExchangeCards()

  // Use gameService for exchange
  await gameService.handleExchangeReturn(game.id, botId, cardIds)
}
