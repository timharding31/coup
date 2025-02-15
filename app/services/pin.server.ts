import { Reference } from 'firebase-admin/database'
import { db } from './firebase.server'

export class PinService {
  private gamesByPinRef: Reference = db.ref('gamesByPin')

  async generateUniquePin(): Promise<string> {
    const maxAttempts = 10
    let attempts = 0
    const pinLength = 4
    const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZ'
    while (attempts < maxAttempts) {
      // Generate a random 4-character PIN
      let pin = ''
      for (let i = 0; i < pinLength; i++) {
        const randomIndex = Math.floor(Math.random() * chars.length)
        pin += chars[randomIndex]
      }

      // Check if PIN is already in use
      const existingGame = await this.gamesByPinRef.child(pin).get()

      if (!existingGame.exists()) {
        return pin
      }

      attempts++
    }

    throw new Error('Failed to generate unique PIN')
  }

  isValidPin(pin: string): boolean {
    if (pin.length !== 4) return false

    // Check if PIN contains only allowed characters
    const allowedChars = /^[0-9A-HJ-NP-Z]+$/ // Regex excludes I and O
    return allowedChars.test(pin)
  }

  async getGameIdByPin(pin: string): Promise<string> {
    const normalizedPin = pin.trim().toUpperCase()

    if (!this.isValidPin(normalizedPin)) {
      throw new Error('Invalid PIN format')
    }

    // Look up game ID from PIN
    const gameIdSnapshot = await this.gamesByPinRef.child(normalizedPin).get()
    const gameId = gameIdSnapshot.val() as string

    if (!gameId) {
      throw new Error('Game not found')
    }

    return gameId
  }

  async saveGameIdByPin(pin: string, gameId: string): Promise<void> {
    const normalizedPin = pin.trim().toUpperCase()
    await this.gamesByPinRef.child(normalizedPin).set(gameId)
  }

  async removeGamePin(pin: string): Promise<void> {
    await this.gamesByPinRef.child(pin).remove()
  }
}
