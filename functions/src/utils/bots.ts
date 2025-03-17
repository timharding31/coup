import { Game, Player, TurnState } from '../types'

/**
 * Determines which bot players need to respond in the current turn phase
 */
export function getBotsNeedingResponse(game: Game): {
  botIds: string[]
  responseType: 'turn' | 'action' | 'block' | 'defense' | 'card' | 'exchange'
} {
  // If there's no active turn, check if it's a bot's turn to play
  if (!game?.currentTurn) {
    if (game?.currentPlayerIndex !== undefined) {
      const currentPlayer = game.players[game.currentPlayerIndex]
      if (currentPlayer && currentPlayer.id.startsWith('bot-') && !isPlayerEliminated(currentPlayer)) {
        return {
          botIds: [currentPlayer.id],
          responseType: 'turn'
        }
      }
    }
    return { botIds: [], responseType: 'turn' }
  }

  const { currentTurn, players } = game
  const { phase, action, respondedPlayers = [] } = currentTurn

  // Filter out players who have already responded or are eliminated
  const getEligibleBots = (playerIds: string[]) => {
    return playerIds.filter(
      id =>
        id.startsWith('bot-') && !respondedPlayers.includes(id) && !isPlayerEliminated(players.find(p => p.id === id))
    )
  }

  // Get all bots who should respond to an action
  const getActionResponseBots = () => {
    // Only unresponded, non-actors can respond to action
    return getEligibleBots(players.filter(p => p.id !== action.playerId).map(p => p.id))
  }

  switch (phase) {
    case 'AWAITING_OPPONENT_RESPONSES': {
      return {
        botIds: getActionResponseBots(),
        responseType: 'action'
      }
    }

    case 'AWAITING_TARGET_BLOCK_RESPONSE': {
      // Only target can respond to actor after their challenge defense
      if (action.targetPlayerId?.startsWith('bot-')) {
        const targetBotId = action.targetPlayerId
        if (!respondedPlayers.includes(targetBotId)) {
          return {
            botIds: [targetBotId],
            responseType: 'action'
          }
        }
      }
      break
    }

    case 'AWAITING_ACTIVE_RESPONSE_TO_BLOCK': {
      // Only actor can respond to block
      if (action.playerId.startsWith('bot-')) {
        return {
          botIds: [action.playerId],
          responseType: 'block'
        }
      }
      break
    }

    case 'AWAITING_ACTOR_DEFENSE': {
      // Only actor can defend action challenge
      if (action.playerId.startsWith('bot-')) {
        return {
          botIds: [action.playerId],
          responseType: 'defense'
        }
      }
      break
    }

    case 'AWAITING_BLOCKER_DEFENSE': {
      // Only blocker can defend block-challenge
      const blocker = currentTurn.opponentResponses?.block
      if (blocker && blocker.startsWith('bot-')) {
        return {
          botIds: [blocker],
          responseType: 'defense'
        }
      }
      break
    }

    case 'AWAITING_CHALLENGE_PENALTY_SELECTION': {
      // Only challenger can select penalty card
      const challenger = currentTurn.challengeResult?.challengerId
      if (challenger && challenger.startsWith('bot-')) {
        return {
          botIds: [challenger],
          responseType: 'card'
        }
      }
      break
    }

    case 'AWAITING_TARGET_SELECTION': {
      // Only target can select target card
      if (action.targetPlayerId?.startsWith('bot-')) {
        return {
          botIds: [action.targetPlayerId],
          responseType: 'card'
        }
      }
      break
    }

    case 'AWAITING_EXCHANGE_RETURN': {
      // Only actor can exchange cards
      if (action.playerId.startsWith('bot-')) {
        return {
          botIds: [action.playerId],
          responseType: 'exchange'
        }
      }
      break
    }

    // If we're in a terminal phase, check for bot's next turn
    case 'TURN_COMPLETE':
    case 'ACTION_FAILED':
    case 'ACTION_EXECUTION': {
      // These phases automatically progress to the next player
      // If the next player is a bot, it will be handled when currentTurn is null
      break
    }
  }

  return { botIds: [], responseType: 'turn' }
}

/**
 * Helper function to check if a player is eliminated
 */
function isPlayerEliminated(player?: Player): boolean {
  return player ? player.influence.every(card => card.isRevealed) : true
}

/**
 * Function to check if all required players have responded
 */
export function haveAllPlayersResponded(game: Game, turn: TurnState): boolean {
  const requiredResponses = getAllRespondingPlayers(game, turn)
  return requiredResponses.every(id => turn.respondedPlayers?.includes(id))
}

/**
 * Get all players who need to respond
 */
function getAllRespondingPlayers(game: Game, turn: TurnState): string[] {
  return game.players
    .filter(p => !p.influence.every(card => card.isRevealed)) // Filter out dead players
    .filter(p => p.id !== turn.action.playerId) // Filter out active player
    .map(p => p.id)
}
