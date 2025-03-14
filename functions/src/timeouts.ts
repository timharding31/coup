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

/**
 * Cloud function that triggers when a game's timeoutAt field is updated
 * Handles game response timeouts independently from the main application
 */
export const handleGameTimeouts = functions
  .runWith({
    timeoutSeconds: 540, // 9 minutes max runtime
    memory: '256MB'
  })
  .database.ref('/games/{gameId}/currentTurn')
  .onWrite(async (change, context) => {
    const { gameId } = context.params
    console.log(`[TIMEOUT FUNCTION] Triggered for game: ${gameId}`)
    
    const turnData = change.after.val() as TurnState | null
    console.log(`[TIMEOUT FUNCTION] Current turn data:`, JSON.stringify(turnData, null, 2))

    // If there's no turn data or no timeout, exit early
    if (!turnData || !turnData.timeoutAt) {
      return null
    }

    const timeoutAt = turnData.timeoutAt
    const timeoutPhase = turnData.phase

    // Only process timeouts for waiting phases
    if (!isWaitingPhase(timeoutPhase)) {
      console.log(`[TIMEOUT FUNCTION] Not a waiting phase (${timeoutPhase}), skipping`)
      return null
    }

    // Calculate how long to wait until the timeout
    const now = Date.now()
    const timeoutDelay = timeoutAt - now
    console.log(`[TIMEOUT FUNCTION] Current time: ${now}, timeout at: ${timeoutAt}, delay: ${timeoutDelay}ms`)

    // If timeout is in the past or too short, process immediately
    if (timeoutDelay <= 0) {
      console.log(`[TIMEOUT FUNCTION] Timeout already expired, processing immediately`)
      return processTimeout(gameId)
    }

    // If timeout is too far in the future (> 8 minutes), schedule it for later
    if (timeoutDelay > 480000) {
      console.log(`[TIMEOUT FUNCTION] Timeout too far in future (${timeoutDelay}ms). Exiting.`)
      return null
    }

    // Wait until the timeout should trigger (add buffer for safety)
    console.log(`[TIMEOUT FUNCTION] Scheduling timeout for game ${gameId} in ${timeoutDelay}ms`)
    await new Promise(resolve => setTimeout(resolve, timeoutDelay + BUFFER_MS))
    console.log(`[TIMEOUT FUNCTION] Timeout wait completed for game ${gameId}`)

    // Check if the timeout is still relevant before processing
    const gameRef = db.ref(`games/${gameId}`)
    const snapshot = await gameRef.get()
    const game = snapshot.val()
    console.log(`[TIMEOUT FUNCTION] Game state after waiting:`, JSON.stringify({
      id: game?.id,
      hasCurrentTurn: !!game?.currentTurn,
      phase: game?.currentTurn?.phase,
      timeoutAt: game?.currentTurn?.timeoutAt
    }, null, 2))

    if (!game?.currentTurn || game.currentTurn.phase !== timeoutPhase || game.currentTurn.timeoutAt !== timeoutAt) {
      console.log('[TIMEOUT FUNCTION] Timeout is no longer relevant')
      return null
    }

    // Process the timeout
    console.log(`[TIMEOUT FUNCTION] Processing timeout for game ${gameId}`)
    return processTimeout(gameId)
  })

/**
 * Process a game timeout by updating the database
 */
async function processTimeout(gameId: string): Promise<void> {
  console.log(`[TIMEOUT FUNCTION] Starting timeout processing for game ${gameId}`)
  const gameRef = db.ref(`games/${gameId}`)

  // Transaction to safely handle the timeout
  await gameRef.transaction((game: Game | null): Game | null => {
    if (!game?.currentTurn) return game

    const turn = game.currentTurn

    // Don't process timeouts for phases that don't support them
    if (!isWaitingPhase(turn.phase)) {
      return game
    }

    // Don't process timeouts that haven't actually expired
    if (turn.timeoutAt > Date.now()) {
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
          updatedTurn.timeoutAt = 0 // Clear timeoutAt
        }
        break

      case 'AWAITING_ACTIVE_RESPONSE_TO_BLOCK':
        updatedTurn.phase = 'ACTION_FAILED'
        updatedTurn.timeoutAt = 0 // Clear timeoutAt
        break

      case 'AWAITING_TARGET_BLOCK_RESPONSE':
        updatedTurn.phase = 'ACTION_EXECUTION'
        updatedTurn.timeoutAt = 0 // Clear timeoutAt
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

/**
 * Helper function to check if a phase should have timeouts
 */
function isWaitingPhase(phase: string): boolean {
  return [
    'AWAITING_OPPONENT_RESPONSES',
    'AWAITING_ACTIVE_RESPONSE_TO_BLOCK',
    'AWAITING_TARGET_BLOCK_RESPONSE'
  ].includes(phase)
}
