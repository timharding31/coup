import { Reference } from 'firebase-admin/database'
import { Action, Game, Player } from '~/types'
import { ACTION_REQUIREMENTS } from '~/utils/action'

export interface IActionService {
  validateAction(game: Game, action: Action): boolean
  resolveCoinUpdates(game: Game, action: Action): Promise<void>
  updatePlayerCoins(gameId: string, updates: { [playerId: string]: number }): Promise<void>
  revealInfluence(gameId: string, playerId: string, cardId: string): Promise<void>
}

export class ActionService implements IActionService {
  private gamesRef: Reference

  constructor(gamesRef: Reference) {
    this.gamesRef = gamesRef
  }

  validateAction(game: Game, action: Action): boolean {
    const player = game.players.find(p => p.id === action.playerId)
    if (!player) {
      console.error(`Player ${action.playerId} not found in game`)
      return false
    }

    // Force coup at 10+ coins
    if (player.coins >= 10 && action.type !== 'COUP') {
      console.error(`Player has ${player.coins} coins but isn't using COUP`)
      return false
    }

    // Check basic requirements
    const requirements = ACTION_REQUIREMENTS[action.type]
    if (!requirements) {
      console.error(`No requirements found for action type ${action.type}`)
      return false
    }

    if (player.coins < requirements.coinCost) {
      console.error(`Player has ${player.coins} coins but needs ${requirements.coinCost} for ${action.type}`)
      return false
    }

    // Check if player is eliminated
    if (this.isDeadPlayer(player)) {
      console.error(`Player ${player.username} is eliminated, cannot take actions`)
      return false
    }

    // Validate target if required
    if (action.targetPlayerId) {
      const targetPlayer = game.players.find(p => p.id === action.targetPlayerId)
      if (!targetPlayer) {
        console.error(`Target player ${action.targetPlayerId} not found`)
        return false
      }

      if (this.isDeadPlayer(targetPlayer)) {
        console.error(`Target player ${targetPlayer.username} is eliminated`)
        return false
      }

      // Additional target-specific validation
      if (action.type === 'STEAL' && targetPlayer.coins === 0) {
        console.error(`Cannot steal from ${targetPlayer.username} - they have 0 coins`)
        return false
      }
    }

    return true
  }

  private isDeadPlayer(player: Player): boolean {
    return player.influence.every(card => card.isRevealed)
  }

  async updatePlayerCoins(gameId: string, updates: { [playerId: string]: number }): Promise<void> {
    const gameRef = this.gamesRef.child(gameId)
    const result = await gameRef.transaction((game: Game | null): Game | null => {
      if (!game || !game.players?.length) {
        return game
      }
      const updatedPlayers = game.players.map(p => {
        if (this.isDeadPlayer(p)) return p
        const amount = updates[p.id] || 0
        return {
          ...p,
          coins: Math.max(0, p.coins + amount)
        }
      })

      return {
        ...game,
        players: updatedPlayers,
        updatedAt: Date.now()
      }
    })

    if (!result.committed) {
      throw new Error('Failed to update player coins')
    }
  }

  async resolveCoinUpdates(game: Game, action: Action): Promise<void> {
    const coinEffects = new Map<string, number>()
    switch (action.type) {
      case 'INCOME':
        coinEffects.set(action.playerId, 1)
        break

      case 'FOREIGN_AID':
        coinEffects.set(action.playerId, 2)
        break

      case 'TAX':
        coinEffects.set(action.playerId, 3)
        break

      case 'STEAL':
        const targetCoins = this.getPlayerCoins(game, action.targetPlayerId)
        const stealAmount = Math.min(2, targetCoins)
        coinEffects.set(action.targetPlayerId, -stealAmount)
        coinEffects.set(action.playerId, stealAmount)
        break

      default:
        break
    }

    await this.updatePlayerCoins(game.id, Object.fromEntries(coinEffects.entries()))
  }

  getPlayerCoins(game: Game, playerId: string): number {
    const player = game.players.find(p => p.id === playerId)
    if (!player) {
      throw new Error('Player not found')
    }
    return player.coins || 0
  }

  async revealInfluence(gameId: string, playerId: string, cardId: string): Promise<void> {
    const gameRef = this.gamesRef.child(gameId)
    const result = await gameRef.transaction((game: Game | null): Game | null => {
      const turn = game?.currentTurn
      if (!game || !turn || !game.players) return game

      const playerIndex = game.players.findIndex(p => p.id === playerId)
      if (playerIndex === -1) {
        console.error('Player not found')
        return game
      }

      const cardIndex = game.players[playerIndex]!.influence.findIndex(c => c.id === cardId)
      if (cardIndex === -1) {
        console.error('Card not found')
        return game
      }

      if (game.players[playerIndex].influence[cardIndex].isRevealed) {
        console.error('Card already revealed')
        return game
      }

      const updatedPlayers = game.players.slice()
      updatedPlayers[playerIndex].influence[cardIndex].isRevealed = true

      return {
        ...game,
        players: updatedPlayers,
        updatedAt: Date.now()
      }
    })

    if (!result.committed) {
      throw new Error('Failed to reveal challenge loser card')
    }
  }
}
