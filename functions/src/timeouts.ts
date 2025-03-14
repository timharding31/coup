import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import { Game, TurnState } from './types'

// Use existing admin initialization or initialize if needed
let db: admin.database.Database
try {
  db = admin.database()
} catch (e) {
  // Only initialize if it hasn't been initialized yet
  admin.initializeApp()
  db = admin.database()
}
const BUFFER_MS = 500 // Buffer to prevent race conditions

const appUrl = functions.config().app.url || 'https://polarcoup.app'

/**
 * Cloud function that triggers when a game's timeoutAt field is updated
 * Handles game response timeouts independently from the main application
 */
export const handleGameTimeouts = functions
  .runWith({
    timeoutSeconds: 540, // 9 minutes max runtime
    memory: '256MB'
  })
  .database.ref('/games/{gameId}/currentTurn/timeoutAt')
  .onWrite(async (change, context) => {
    const { gameId } = context.params

    const timeoutAt = change.after.val() as number | null

    // If there's no turn data or no timeout, exit early
    if (!timeoutAt) {
      return null
    }

    const turnRef = db.ref(`games/${gameId}/currentTurn`)
    const turnData = (await turnRef.get()).val() as TurnState | null
    const timeoutPhase = turnData?.phase
    const timeoutActor = turnData?.action.playerId

    // Only process timeouts for waiting phases
    if (!turnData || !isWaitingPhase(turnData.phase)) {
      return null
    }

    // Calculate how long to wait until the timeout
    const now = Date.now()
    const timeoutDelay = timeoutAt - now

    // If timeout is in the past or too short, process immediately
    if (timeoutDelay <= 0) {
      return processTimeout(gameId)
    }

    // Wait until the timeout should trigger (add buffer for safety)
    await new Promise(resolve => setTimeout(resolve, timeoutDelay + BUFFER_MS))

    // Check if the timeout is still relevant before processing
    const snapshot = await turnRef.get()
    const updatedTurn = snapshot.val() as TurnState | null

    if (
      !updatedTurn ||
      updatedTurn.action.playerId !== timeoutActor ||
      updatedTurn.phase !== timeoutPhase ||
      updatedTurn.timeoutAt !== timeoutAt
    ) {
      return null
    }

    // Process the timeout
    return processTimeout(gameId)
  })

/**
 * Process a game timeout by updating the database
 */
async function processTimeout(gameId: string): Promise<void> {
  const gameRef = db.ref(`games/${gameId}`)

  // Transaction to safely handle the timeout
  const result = await gameRef.transaction((game: Game | null): Game | null => {
    if (!game?.currentTurn) return game

    const turn = game.currentTurn

    // Don't process timeouts for phases that don't support them
    if (!isWaitingPhase(turn.phase)) {
      return game
    }

    // Don't process timeouts that don't exist or haven't expired
    if (!turn.timeoutAt || turn.timeoutAt > Date.now()) {
      return game
    }

    const respondedPlayers = turn.respondedPlayers?.slice() || []
    const nonRespondedPlayers = game.players
      .map(p => p.id)
      .filter(playerId => {
        // Exclude the player who started the action
        if (turn.phase === 'AWAITING_OPPONENT_RESPONSES' && playerId === turn.action.playerId) {
          return false
        }
        if (turn.phase === 'AWAITING_ACTIVE_RESPONSE_TO_BLOCK' && playerId === turn.opponentResponses?.block) {
          return false
        }
        if (turn.phase === 'AWAITING_TARGET_BLOCK_RESPONSE' && playerId !== turn.action.targetPlayerId) {
          return false
        }
        // Exclude players who have already responded
        if (respondedPlayers.includes(playerId)) return false
        // Exclude eliminated players
        const player = game.players.find(p => p.id === playerId)
        if (player && player.influence.every(card => card.isRevealed)) return false
        return true
      })

    // Add all non-responded players as implicit accepts
    const updatedRespondedPlayers = respondedPlayers.concat(nonRespondedPlayers)
    const updatedTurn = { ...turn, respondedPlayers: updatedRespondedPlayers }

    // Progress the phase based on current waiting phase
    switch (turn.phase) {
      case 'AWAITING_OPPONENT_RESPONSES':
        if (haveAllPlayersResponded(game, updatedTurn)) {
          updatedTurn.phase = 'ACTION_EXECUTION'
          updatedTurn.timeoutAt = null // Clear timeoutAt
        }
        break

      case 'AWAITING_ACTIVE_RESPONSE_TO_BLOCK':
        updatedTurn.phase = 'ACTION_FAILED'
        updatedTurn.timeoutAt = null // Clear timeoutAt
        break

      case 'AWAITING_TARGET_BLOCK_RESPONSE':
        updatedTurn.phase = 'ACTION_EXECUTION'
        updatedTurn.timeoutAt = null // Clear timeoutAt
        break

      default:
        return game // No change for other phases
    }

    return {
      ...game,
      currentTurn: updatedTurn,
      updatedAt: Date.now()
    }
  })

  if (result.committed) {
    try {
      const game = result.snapshot.val() as Game | null
      if (!game?.currentTurn || !['ACTION_EXECUTION', 'ACTION_FAILED'].includes(game.currentTurn.phase)) {
        throw new Error('Game state is invalid')
      }

      const url = `${appUrl}/api/games/${gameId}/turns/next`
      await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' } })
    } catch (error) {
      console.error(error)
    }
  }
}

/**
 * Helper function to check if all players have responded
 */
function haveAllPlayersResponded(game: Game, turn: TurnState): boolean {
  if (!turn.respondedPlayers) return false

  // Count eligible responders (players who aren't eliminated and aren't the actor)
  const eligibleResponders = game.players.filter(p => {
    // Skip the actor
    if (p.id === turn.action.playerId) return false
    // Skip eliminated players
    if (p.influence.every(c => c.isRevealed)) return false
    return true
  })

  // Check if all eligible responders have responded
  return turn.respondedPlayers.length >= eligibleResponders.length
}

function isWaitingPhase(phase: string): boolean {
  return [
    'AWAITING_OPPONENT_RESPONSES',
    'AWAITING_ACTIVE_RESPONSE_TO_BLOCK',
    'AWAITING_TARGET_BLOCK_RESPONSE'
  ].includes(phase)
}
