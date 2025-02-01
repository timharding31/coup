import { Reference } from 'firebase-admin/database'
import { Action, CardType, Game, Player } from '~/types'

export interface IActionService {
  applyActionEffects(gameId: string, action: Action): Promise<void>
  validateAction(game: Game, action: Action): boolean
  updatePlayerCoins(gameId: string, playerId: string, amount: number): Promise<void>
  revealInfluence(gameId: string, playerId: string): Promise<void>
  isActionBlocked(action: Action, blockingCard: CardType): boolean
}

export class ActionService implements IActionService {
  private gamesRef: Reference

  constructor(gamesRef: Reference) {
    this.gamesRef = gamesRef
  }

  async applyActionEffects(gameId: string, action: Action): Promise<void> {
    switch (action.type) {
      case 'INCOME':
        await this.updatePlayerCoins(gameId, action.playerId, 1)
        break

      case 'FOREIGN_AID':
        await this.updatePlayerCoins(gameId, action.playerId, 2)
        break

      case 'TAX':
        await this.updatePlayerCoins(gameId, action.playerId, 3)
        break

      case 'STEAL':
        if (action.targetPlayerId) {
          const targetCoins = await this.getPlayerCoins(gameId, action.targetPlayerId)
          const stealAmount = Math.min(2, targetCoins)
          await Promise.all([
            this.updatePlayerCoins(gameId, action.playerId, stealAmount),
            this.updatePlayerCoins(gameId, action.targetPlayerId, -stealAmount)
          ])
        }
        break

      case 'ASSASSINATE':
        if (action.targetPlayerId) {
          await Promise.all([
            this.updatePlayerCoins(gameId, action.playerId, -3),
            this.revealInfluence(gameId, action.targetPlayerId)
          ])
        }
        break

      case 'COUP':
        if (action.targetPlayerId) {
          await Promise.all([
            this.updatePlayerCoins(gameId, action.playerId, -7),
            this.revealInfluence(gameId, action.targetPlayerId)
          ])
        }
        break

      case 'EXCHANGE':
        // Exchange is handled separately by the TurnService as it requires
        // player interaction for card selection
        break
    }
  }

  validateAction(game: Game, action: Action): boolean {
    const player = game.players.find(p => p.id === action.playerId)
    if (!player) return false

    // Validate based on action type
    switch (action.type) {
      case 'INCOME':
      case 'FOREIGN_AID':
        return true // Always valid

      case 'TAX':
        return !this.isDeadPlayer(player)

      case 'STEAL':
        if (!action.targetPlayerId) return false
        const targetPlayer = game.players.find(p => p.id === action.targetPlayerId)
        return (
          !this.isDeadPlayer(player) && !!targetPlayer && !this.isDeadPlayer(targetPlayer) && targetPlayer.coins > 0
        )

      case 'ASSASSINATE':
        if (!action.targetPlayerId) return false
        const assassinTarget = game.players.find(p => p.id === action.targetPlayerId)
        return !this.isDeadPlayer(player) && !!assassinTarget && !this.isDeadPlayer(assassinTarget) && player.coins >= 3

      case 'COUP':
        if (!action.targetPlayerId) return false
        const coupTarget = game.players.find(p => p.id === action.targetPlayerId)
        return !this.isDeadPlayer(player) && !!coupTarget && !this.isDeadPlayer(coupTarget) && player.coins >= 7

      case 'EXCHANGE':
        return !this.isDeadPlayer(player)

      default:
        return false
    }
  }

  private isDeadPlayer(player: Player): boolean {
    return player.influence.every(card => card.isRevealed)
  }

  async updatePlayerCoins(gameId: string, playerId: string, amount: number): Promise<void> {
    const playerRef = this.gamesRef.child(`${gameId}/players`)

    await playerRef.transaction((players: Player[] | null) => {
      if (!players) return null

      return players.map(player => {
        if (player.id === playerId) {
          const newAmount = Math.max(0, (player.coins || 0) + amount)
          return {
            ...player,
            coins: newAmount
          }
        }
        return player
      })
    })
  }

  async getPlayerCoins(gameId: string, playerId: string): Promise<number> {
    const snapshot = await this.gamesRef.child(`${gameId}/players`).orderByChild('id').equalTo(playerId).once('value')

    const player = Object.values(snapshot.val())[0] as Player
    return player?.coins || 0
  }

  async revealInfluence(gameId: string, playerId: string): Promise<void> {
    const playerRef = this.gamesRef.child(`${gameId}/players`)

    await playerRef.transaction((players: Player[] | null) => {
      if (!players) return null

      return players.map(player => {
        if (player.id === playerId) {
          const influence = [...player.influence]
          const unrevealed = influence.findIndex(card => !card.isRevealed)

          if (unrevealed !== -1) {
            influence[unrevealed] = {
              ...influence[unrevealed],
              isRevealed: true
            }
          }

          return {
            ...player,
            influence
          }
        }
        return player
      })
    })
  }

  isActionBlocked(action: Action, blockingCard: CardType): boolean {
    switch (action.type) {
      case 'FOREIGN_AID':
        return blockingCard === CardType.DUKE

      case 'STEAL':
        return blockingCard === CardType.AMBASSADOR || blockingCard === CardType.CAPTAIN

      case 'ASSASSINATE':
        return blockingCard === CardType.CONTESSA

      default:
        return false
    }
  }

  getRequiredCharacterForAction(actionType: Action['type']): CardType | null {
    switch (actionType) {
      case 'TAX':
        return CardType.DUKE
      case 'ASSASSINATE':
        return CardType.ASSASSIN
      case 'STEAL':
        return CardType.CAPTAIN
      case 'EXCHANGE':
        return CardType.AMBASSADOR
      default:
        return null
    }
  }

  canBeBlocked(actionType: Action['type']): boolean {
    return ['FOREIGN_AID', 'STEAL', 'ASSASSINATE'].includes(actionType)
  }

  canBeChallenged(actionType: Action['type']): boolean {
    return ['TAX', 'ASSASSINATE', 'STEAL', 'EXCHANGE'].includes(actionType)
  }

  requiresTarget(actionType: Action['type']): boolean {
    return ['STEAL', 'ASSASSINATE', 'COUP'].includes(actionType)
  }

  getActionCost(actionType: Action['type']): number {
    switch (actionType) {
      case 'ASSASSINATE':
        return 3
      case 'COUP':
        return 7
      default:
        return 0
    }
  }
}
