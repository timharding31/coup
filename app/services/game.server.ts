import { type Reference } from 'firebase-admin/database'
import { Action, Card, CardType, Game, Player, TurnState } from '~/types'
import { db } from './firebase.server'

export class GameService {
  private gamesRef: Reference = db.ref('games')
  private playersRef: Reference = db.ref('players')

  async createGame(hostId: string): Promise<string> {
    // First fetch the host's player data
    const hostSnapshot = await this.playersRef.child(hostId).get()
    const hostData = hostSnapshot.val() as Player

    if (!hostData) {
      throw new Error('Host player not found')
    }

    const newGameRef = this.gamesRef.push()

    // Initialize the game deck
    const deck = this.createInitialDeck()

    // Deal initial cards to the host
    const [hostInfluence, remainingDeck] = this.dealCards(deck, 2)

    const initialGame: Game = {
      id: newGameRef.key!,
      status: 'WAITING',
      players: [
        {
          id: hostId,
          username: hostData.username,
          influence: hostInfluence,
          coins: 2, // Starting coins
          isActive: true,
          currentGame: newGameRef.key!
        }
      ],
      deck: remainingDeck,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      currentTurn: 0
    }

    await newGameRef.set(initialGame)

    // Update the host's currentGame reference
    await this.playersRef.child(hostId).update({
      currentGame: newGameRef.key
    })

    return newGameRef.key!
  }

  async getGame(gameId: string): Promise<Game | null> {
    const snapshot = await this.gamesRef.child(gameId).get()
    return snapshot.val() as Game | null
  }

  async startGameTurn(gameId: string, action: Action): Promise<void> {
    const turnRef = this.gamesRef.child(`${gameId}/currentTurn`)

    await turnRef.transaction((currentTurn: TurnState | null) => {
      if (currentTurn && currentTurn.phase !== 'ACTION_RESOLUTION') {
        return undefined // Abort if there's an ongoing turn
      }

      return {
        phase: 'PLAYER_ACTION',
        activePlayer: action.playerId,
        action,
        timeoutAt: Date.now() + (action.autoResolve ? 0 : 20000),
        respondedPlayers: []
      }
    })
  }

  async handlePlayerResponse(
    gameId: string,
    playerId: string,
    response: 'accept' | 'challenge' | 'block'
  ): Promise<void> {
    const turnRef = this.gamesRef.child(`${gameId}/currentTurn`)

    await turnRef.transaction(async (currentTurn: TurnState | null) => {
      if (!currentTurn || !this.isValidResponse(currentTurn, playerId, response)) {
        return // Abort transaction
      }

      const updatedTurn = { ...currentTurn }
      updatedTurn.respondedPlayers.push(playerId)

      switch (response) {
        case 'challenge':
          updatedTurn.phase = 'CHALLENGE_RESOLUTION'
          updatedTurn.challengingPlayer = playerId
          updatedTurn.timeoutAt = Date.now() + 10000
          break

        case 'block':
          updatedTurn.phase = 'BLOCK_RESPONSE'
          updatedTurn.blockingPlayer = playerId
          updatedTurn.timeoutAt = Date.now() + 20000
          updatedTurn.respondedPlayers = [] // Reset for new phase
          break

        case 'accept':
          if (await this.haveAllPlayersResponded(gameId, updatedTurn)) {
            return this.resolveAction(gameId, updatedTurn)
          }
          break
      }

      return updatedTurn
    })
  }

  private async resolveAction(gameId: string, turnState: TurnState): Promise<TurnState> {
    const gameSnapshot = await this.gamesRef.child(gameId).get()
    const game = gameSnapshot.val() as Game

    // First, update player states based on the action
    await this.applyActionEffects(gameId, turnState.action)

    // Then, check if the game is over
    const gameStatus = await this.checkGameStatus(gameId)
    if (gameStatus === 'COMPLETED') {
      await this.gamesRef.child(gameId).child('status').set('COMPLETED')
      return turnState // End the game
    }

    // Move to next player
    const currentPlayerIndex = game.players.findIndex(p => p.id === turnState.activePlayer)
    const nextPlayerIndex = (currentPlayerIndex + 1) % game.players.length

    return {
      phase: 'ACTION_RESOLUTION',
      activePlayer: game.players[nextPlayerIndex].id,
      action: turnState.action,
      resolvedChallenges: turnState.resolvedChallenges,
      respondedPlayers: [],
      timeoutAt: 0
    }
  }

  private async applyActionEffects(gameId: string, action: Action): Promise<void> {
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
          await Promise.all([
            this.updatePlayerCoins(gameId, action.playerId, 2),
            this.updatePlayerCoins(gameId, action.targetPlayerId, -2)
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
    }
  }

  private async updatePlayerCoins(gameId: string, playerId: string, amount: number): Promise<void> {
    const coinsRef = this.gamesRef.child(`${gameId}/players/${playerId}/coins`)

    await coinsRef.transaction((currentCoins: number) => {
      return (currentCoins || 0) + amount
    })
  }

  private async revealInfluence(gameId: string, playerId: string): Promise<void> {
    const playerRef = this.gamesRef.child(`${gameId}/players/${playerId}`)

    await playerRef.transaction((player: Player) => {
      if (!player) return undefined

      const unrevealed = player.influence.findIndex(card => !card.isRevealed)
      if (unrevealed === -1) return undefined // No cards to reveal

      player.influence[unrevealed].isRevealed = true
      return player
    })
  }

  private async checkGameStatus(gameId: string): Promise<'IN_PROGRESS' | 'COMPLETED'> {
    const snapshot = await this.gamesRef.child(`${gameId}/players`).get()
    const players = snapshot.val() as Player[]

    const activePlayers = players.filter(player => player.influence.some(card => !card.isRevealed))

    return activePlayers.length <= 1 ? 'COMPLETED' : 'IN_PROGRESS'
  }

  private isValidResponse(
    currentTurn: TurnState,
    playerId: string,
    response: 'accept' | 'challenge' | 'block'
  ): boolean {
    // Player can't respond to their own action
    if (playerId === currentTurn.activePlayer) return false

    // Player can't respond twice in the same phase
    if (currentTurn.respondedPlayers.includes(playerId)) return false

    // Can't block or challenge if action doesn't allow it
    if (response === 'block' && !currentTurn.action.canBeBlocked) return false
    if (response === 'challenge' && !currentTurn.action.canBeChallenged) return false

    return true
  }

  private async haveAllPlayersResponded(gameId: string, turnState: TurnState): Promise<boolean> {
    const snapshot = await this.gamesRef.child(`${gameId}/players`).get()
    const players = snapshot.val() as Player[]

    const requiredResponses = players.filter(
      p => p.id !== turnState.activePlayer && p.influence.some(card => !card.isRevealed)
    ).length

    return turnState.respondedPlayers.length >= requiredResponses
  }

  private createInitialDeck(): Card[] {
    const cardTypes = [
      CardType.DUKE,
      CardType.ASSASSIN,
      CardType.CONTESSA,
      CardType.CAPTAIN,
      CardType.AMBASSADOR
    ]

    // Create 3 copies of each card
    const deck = cardTypes.flatMap(type =>
      Array(3)
        .fill(null)
        .map(() => ({
          id: crypto.randomUUID(),
          type,
          isRevealed: false
        }))
    )

    // Shuffle the deck
    return deck.sort(() => Math.random() - 0.5)
  }

  private dealCards(deck: Card[], count: number): [Card[], Card[]] {
    const dealt = deck.slice(0, count)
    const remaining = deck.slice(count)
    return [dealt, remaining]
  }
}
