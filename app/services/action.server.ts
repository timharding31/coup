import { Reference } from 'firebase-admin/database'
import { Action, CardType, Game, Player } from '~/types'
import { ACTION_REQUIREMENTS } from '~/utils/action'

export interface IActionService {
  validateAction(game: Game, action: Action): boolean
  resolveCoinUpdates(gameId: string, action: Action): Promise<void>
  updatePlayerCoins(gameId: string, playerId: string, amount: number): Promise<void>
  revealInfluence(gameId: string, playerId: string, cardId: string): Promise<void>
}

export class ActionService implements IActionService {
  private gamesRef: Reference

  constructor(gamesRef: Reference) {
    this.gamesRef = gamesRef
  }

  validateAction(game: Game, action: Action): boolean {
    const player = game.players.find(p => p.id === action.playerId)
    if (!player) return false

    // Force coup at 10+ coins
    if (player.coins >= 10 && action.type !== 'COUP') return false

    // Check basic requirements
    const requirements = ACTION_REQUIREMENTS[action.type]
    if (!requirements) return false
    if (player.coins < requirements.coinCost) return false

    // Check if player is eliminated
    if (this.isDeadPlayer(player)) return false

    // Validate target if required
    if (action.targetPlayerId) {
      const targetPlayer = game.players.find(p => p.id === action.targetPlayerId)
      if (!targetPlayer || this.isDeadPlayer(targetPlayer)) return false

      // Additional target-specific validation
      if (action.type === 'STEAL' && targetPlayer.coins === 0) return false
    }

    return true
  }

  private isDeadPlayer(player: Player): boolean {
    return player.influence.every(card => card.isRevealed)
  }

  async updatePlayerCoins(gameId: string, playerId: string, amount: number): Promise<void> {
    if (!amount) return

    const gameRef = this.gamesRef.child(gameId)
    const result = await gameRef.transaction((game: Game | null) => {
      if (!game || !game.players) return game

      const playerIndex = game.players.findIndex(p => p.id === playerId)
      if (playerIndex === -1) {
        console.error('Player not found while updating coins')
        return game
      }

      const updatedPlayers = game.players.slice()
      const currentCoins = game.players[playerIndex]!.coins
      updatedPlayers[playerIndex].coins = Math.max(0, currentCoins + amount)

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

  async resolveCoinUpdates(gameId: string, action: Action): Promise<void> {
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
        const targetCoins = await this.getPlayerCoins(gameId, action.targetPlayerId)
        const stealAmount = Math.min(2, targetCoins)
        coinEffects.set(action.targetPlayerId, -stealAmount)
        coinEffects.set(action.playerId, stealAmount)
        break

      default:
        break
    }
    await Promise.all(Array.from(coinEffects.entries()).map(entry => this.updatePlayerCoins(gameId, ...entry)))
  }

  async getPlayerCoins(gameId: string, playerId: string): Promise<number> {
    const snapshot = await this.gamesRef.child(`${gameId}/players`).orderByChild('id').equalTo(playerId).once('value')

    const player = Object.values(snapshot.val())[0] as Player
    return player?.coins || 0
  }

  async revealInfluence(gameId: string, playerId: string, cardId: string): Promise<void> {
    const gameRef = this.gamesRef.child(gameId)
    const result = await gameRef.transaction((game: Game | null) => {
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
