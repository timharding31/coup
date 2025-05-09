import { Reference } from 'firebase-admin/database'
import { db } from './firebase.server'

import type { Player } from '~/types'

type PlayerInDatabase = Omit<Player, 'influence' | 'coins'>

export class PlayerService {
  private playersRef: Reference = db.ref('players')

  async createPlayer(username: string): Promise<{ playerId: string }> {
    const newPlayerRef = this.playersRef.push()
    const playerId = newPlayerRef.key!

    const player: PlayerInDatabase = {
      id: playerId,
      username,
      currentGameId: null
    }

    await newPlayerRef.set(player)
    return { playerId }
  }

  async getPlayer(playerId: string): Promise<{ player: PlayerInDatabase | null }> {
    const snapshot = await this.playersRef.child(playerId).get()
    return { player: snapshot.val() }
  }

  async updatePlayer(playerId: string, updates: Partial<PlayerInDatabase>): Promise<{ player: Player | null }> {
    const result = await this.playersRef.child(playerId).transaction((player: Player | null): Player | null => {
      if (!player) return player
      return { ...player, ...updates }
    })

    if (!result.committed) {
      throw new Error('Failed to update player')
    }

    return { player: result.snapshot.val() as Player | null }
  }

  async deletePlayer(playerId: string): Promise<void> {
    await this.playersRef.child(playerId).remove()
  }
}
