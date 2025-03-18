import * as functions from 'firebase-functions'
import { getDatabase } from './utils/db'
import { BotResponse, Game } from './types'

// Get shared database reference
const db = getDatabase()

// URL for the application API
const appUrl = functions.config().app?.url || 'https://polarcoup.app'

// Configure function
export const processBotActions = functions
  .runWith({
    timeoutSeconds: 540, // 9 minutes max runtime
    memory: '256MB',
    secrets: ['SERVICE_TOKEN']
  })
  .database.ref('/botResponseRequests/{gameId}')
  .onWrite(async (change, context) => {
    const { gameId } = context.params

    // Skip if value is being deleted (this happens when a turn ends)
    if (!change.after.exists()) {
      return null
    }

    // Get the current game state
    const gameSnapshot = await db.ref(`games/${gameId}`).get()
    if (!gameSnapshot.exists()) {
      console.log(`Game ${gameId} not found`)
      return null
    }

    const game = gameSnapshot.val() as Game
    const botResponseValue = change.after.val() as BotResponse
    const { phase, botIds } = botResponseValue

    try {
      if (game.status !== 'IN_PROGRESS') {
        throw new Error(`Will not process bot actions for game in status: ${game.status}`)
      }

      if (game.currentTurn && phase !== game.currentTurn.phase) {
        throw new Error(`Phase mismatch: ${phase} !== ${game.currentTurn.phase}`)
      }

      if (!botIds?.length) {
        throw new Error(`No bots need to respond for game ${gameId} in phase ${game.currentTurn?.phase}`)
      }

      switch (phase) {
        case 'AWAITING_BOT_ACTION':
          await handleBotTurn(gameId, botIds[0])
          break

        case 'AWAITING_OPPONENT_RESPONSES':
          await handleBotActionResponse(gameId, botIds)
          break

        case 'AWAITING_TARGET_BLOCK_RESPONSE':
          await handleBotBlockResponse(gameId, botIds[0])
          break

        case 'AWAITING_ACTIVE_RESPONSE_TO_BLOCK':
          await handleBotBlockResponse(gameId, botIds[0])
          break

        case 'AWAITING_ACTOR_DEFENSE':
        case 'AWAITING_BLOCKER_DEFENSE':
          await handleBotDefense(gameId, botIds[0])
          break

        case 'AWAITING_CHALLENGE_PENALTY_SELECTION':
        case 'AWAITING_TARGET_SELECTION':
          await handleBotCardSelection(gameId, botIds[0])
          break

        case 'AWAITING_EXCHANGE_RETURN':
          await handleBotExchangeReturn(gameId, botIds[0])
          break
      }
    } catch (error) {
      console.error(`Error processing bot actions for game ${gameId}:`, error)
    }
    return null
  })

/**
 * Handle a bot's turn by choosing an action
 */
async function handleBotTurn(gameId: string, botId: string): Promise<void> {
  // Make API call to process the bot turn
  const response = await fetch(`${appUrl}/api/games/${gameId}/bot-actions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.SERVICE_TOKEN}`
    },
    body: JSON.stringify({
      botId,
      action: 'turn'
    })
  })

  if (!response.ok) {
    throw new Error(`Failed to process bot turn: ${response.statusText}`)
  }
}

/**
 * Handle bot action responses
 */
async function handleBotActionResponse(gameId: string, botIds: string[] | null = []): Promise<void> {
  if (!botIds?.length) return

  try {
    // Send all botIds at once to reduce race conditions
    const response = await fetch(`${appUrl}/api/games/${gameId}/bot-actions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.SERVICE_TOKEN}`
      },
      body: JSON.stringify({
        botId: botIds,
        action: 'respond'
      })
    })

    if (!response.ok) {
      console.error(`Failed to process bot action responses: ${response.statusText}`)
    }
  } catch (error) {
    console.error(`Error processing bot action responses:`, error)
  }
}

/**
 * Handle bot response to a block
 */
async function handleBotBlockResponse(gameId: string, botId: string): Promise<void> {
  const response = await fetch(`${appUrl}/api/games/${gameId}/bot-actions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.SERVICE_TOKEN}`
    },
    body: JSON.stringify({
      botId,
      action: 'block-response'
    })
  })

  if (!response.ok) {
    throw new Error(`Failed to process bot block response: ${response.statusText}`)
  }
}

/**
 * Handle bot defense against a challenge
 */
async function handleBotDefense(gameId: string, botId: string): Promise<void> {
  const response = await fetch(`${appUrl}/api/games/${gameId}/bot-actions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.SERVICE_TOKEN}`
    },
    body: JSON.stringify({
      botId,
      action: 'defense'
    })
  })

  if (!response.ok) {
    throw new Error(`Failed to process bot defense: ${response.statusText}`)
  }
}

/**
 * Handle bot card selection
 */
async function handleBotCardSelection(gameId: string, botId: string): Promise<void> {
  const response = await fetch(`${appUrl}/api/games/${gameId}/bot-actions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.SERVICE_TOKEN}`
    },
    body: JSON.stringify({
      botId,
      action: 'select-card'
    })
  })

  if (!response.ok) {
    throw new Error(`Failed to process bot card selection: ${response.statusText}`)
  }
}

/**
 * Handle bot exchange card selection
 */
async function handleBotExchangeReturn(gameId: string, botId: string): Promise<void> {
  const response = await fetch(`${appUrl}/api/games/${gameId}/bot-actions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.SERVICE_TOKEN}`
    },
    body: JSON.stringify({
      botId,
      action: 'exchange'
    })
  })

  if (!response.ok) {
    throw new Error(`Failed to process bot exchange: ${response.statusText}`)
  }
}
