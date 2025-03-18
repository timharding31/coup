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
        await gameService.setBotActionInProgress(gameId!, true)
        await handleBotActionResponses(game, botIds)
        await gameService.setBotActionInProgress(gameId!, false)
        break

      case 'block-response':
        await handleBotActionResponses(game, botIds)
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
  const { currentTurn, players = [] } = game
  if (!currentTurn) return

  const allPlayers = new Map(players.map(player => [player.id, player]))
  const botPlayers = botIds.map(id => allPlayers.get(id)).filter(nonNil)

  try {
    while (botPlayers.length) {
      const randomIndex = Math.floor(Math.random() * botPlayers.length)
      const [bot] = botPlayers.splice(randomIndex, 1)
      if (!bot || !CoupRobot.isBotPlayer(bot)) {
        console.error(`Bot not found or not a bot, skipping...`)
        continue
      }
      const robot = await CoupRobot.create(bot, game)
      const result = await robot.decideResponse()

      switch (currentTurn.phase) {
        case 'AWAITING_OPPONENT_RESPONSES':
          switch (result.response) {
            case 'block':
              await gameService.handleResponse(game.id, bot.id, 'block', result.blockCard)
              break

            case 'challenge':
            case 'accept':
              await gameService.handleResponse(game.id, bot.id, result.response)
              break
          }
          break

        case 'AWAITING_TARGET_BLOCK_RESPONSE':
          switch (result.response) {
            case 'block':
              await gameService.handleResponse(game.id, bot.id, 'block', result.blockCard)
              break

            case 'accept':
              await gameService.handleResponse(game.id, bot.id, 'accept')
              break

            case 'challenge':
              console.error('Cannot challenge in this phase')
              break
          }
          break

        case 'AWAITING_ACTIVE_RESPONSE_TO_BLOCK':
          switch (result.response) {
            case 'block':
              console.error('Cannot block in this phase')
              break

            case 'accept':
            case 'challenge':
              await gameService.handleResponse(game.id, bot.id, result.response)
              break
          }
          break

        default:
          break
      }

      if (result.response === 'block' || result.response === 'challenge') {
        // Stop processing after a block or challenge is issued because we're moving to a new phase
        break
      }
    }
  } catch (err) {
    console.error(err instanceof Error ? err.message : 'Error handling bot responses')
  }
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
  try {
    await gameService.handleCardSelection(game.id, botId, cardId)
  } catch (err) {
    console.error(err instanceof Error ? err.message : 'Error handling bot defense')
  }
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
  try {
    await gameService.handleCardSelection(game.id, botId, cardId)
  } catch (err) {
    console.error(err instanceof Error ? err.message : 'Error handling bot defense')
  }
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

function nonNil<T extends {}>(val?: T | null): val is T {
  return !!val
}
