import * as functions from 'firebase-functions'
import { getDatabase } from './utils/db'
import { getBotsNeedingResponse } from './utils/bots'
import { Game } from './types'

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
  .database.ref('/games/{gameId}/currentTurn/phase')
  .onWrite(async (change, context) => {
    const { gameId } = context.params

    // Skip if value is being deleted (this happens when a turn ends)
    if (!change.after.exists()) {
      // Check if we need to process a bot's turn
      await processBotTurn(gameId)
      return null
    }

    // Get the current game state
    const gameSnapshot = await db.ref(`games/${gameId}`).get()
    if (!gameSnapshot.exists()) {
      console.log(`Game ${gameId} not found`)
      return null
    }

    const game = gameSnapshot.val() as Game

    try {
      // Determine which bots need to respond
      const { botIds, responseType } = getBotsNeedingResponse(game)

      if (botIds.length === 0) {
        // No bots need to respond
        console.log(`No bots need to respond for game ${gameId} in phase ${game.currentTurn?.phase}`)
        return null
      }

      console.log(`Processing ${responseType} for bots ${botIds.join(', ')} in game ${gameId}`)

      // Process bot responses based on type
      switch (responseType) {
        case 'turn':
          await handleBotTurn(gameId, botIds[0])
          break

        case 'action':
          await handleBotActionResponse(gameId, botIds)
          break

        case 'block':
          await handleBotBlockResponse(gameId, botIds[0])
          break

        case 'defense':
          await handleBotDefense(gameId, botIds[0])
          break

        case 'card':
          await handleBotCardSelection(gameId, botIds[0])
          break

        case 'exchange':
          await handleBotExchangeReturn(gameId, botIds[0])
          break
      }
    } catch (error) {
      console.error(`Error processing bot actions for game ${gameId}:`, error)
    } finally {
      // Always reset the bot action in progress flag
    }

    return null
  })

/**
 * Process a bot's turn when it's their turn to act
 */
async function processBotTurn(gameId: string): Promise<void> {
  // Get the current game state
  const gameSnapshot = await db.ref(`games/${gameId}`).get()
  if (!gameSnapshot.exists()) {
    return
  }

  const game = gameSnapshot.val() as Game

  // Check if it's a bot's turn to play
  const { botIds } = getBotsNeedingResponse(game)

  if (botIds.length > 0) {
    await handleBotTurn(gameId, botIds[0])
  }
}

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
async function handleBotActionResponse(gameId: string, botIds: string[]): Promise<void> {
  if (botIds.length === 0) return

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
