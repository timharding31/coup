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

  async getPlayerByUsername(username: string): Promise<{ playerId: string | null; player: PlayerInDatabase | null }> {
    const snapshot = await this.playersRef.get()
    const players = snapshot.val() as Record<string, PlayerInDatabase>

    if (!players) {
      return { playerId: null, player: null }
    }

    const entry = Object.entries(players).find(([_, player]) => player.username === username)

    if (!entry) {
      return { playerId: null, player: null }
    }

    const [playerId, player] = entry
    return { playerId, player }
  }

  async updatePlayer(playerId: string, updates: Partial<PlayerInDatabase>): Promise<void> {
    await this.playersRef.child(playerId).update(updates)
  }

  async deletePlayer(playerId: string): Promise<void> {
    await this.playersRef.child(playerId).remove()
  }
}
