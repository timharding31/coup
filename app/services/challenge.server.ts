import { Reference } from 'firebase-admin/database'
import { Action, Card, CardType, Game, Player, TurnState } from '~/types'
import { DeckService } from './deck.server'
import { ActionService } from './action.server'

export interface IChallengeService {
  resolveChallenge(
    gameId: string,
    challengedPlayerId: string,
    challengingPlayerId: string,
    challengeType: 'action' | 'block',
    cardType: CardType
  ): Promise<boolean>
  resolveChallengeReveal(game: Game, turn: TurnState): Promise<boolean>
  resolveBlockChallengeReveal(game: Game, turn: TurnState): Promise<boolean>
  handleChallengeResult(
    gameId: string,
    challengedPlayerId: string,
    challengingPlayerId: string,
    challengeSucceeded: boolean,
    revealedCardType: CardType
  ): Promise<void>
}

export class ChallengeService implements IChallengeService {
  private gamesRef: Reference
  private deckService: DeckService
  private actionService: ActionService

  constructor(gamesRef: Reference, deckService: DeckService, actionService: ActionService) {
    this.gamesRef = gamesRef
    this.deckService = deckService
    this.actionService = actionService
  }

  async resolveChallenge(
    gameId: string,
    challengedPlayerId: string,
    challengingPlayerId: string,
    challengeType: 'action' | 'block',
    cardType: CardType
  ): Promise<boolean> {
    // Get current game state
    const gameRef = this.gamesRef.child(gameId)
    const snapshot = await gameRef.get()
    const game = snapshot.val() as Game

    // Check if the challenged player has the claimed card
    const hasCard = await this.deckService.validateCardInHand(gameId, challengedPlayerId, cardType)
    const challengeSucceeded = !hasCard

    // Handle the challenge resolution
    await this.handleChallengeResult(gameId, challengedPlayerId, challengingPlayerId, challengeSucceeded, cardType)

    return challengeSucceeded
  }

  async resolveChallengeReveal(game: Game, turn: TurnState): Promise<boolean> {
    if (!turn.challengingPlayer || !turn.action.requiredCharacter) {
      return false
    }

    const challengedPlayer = game.players.find(p => p.id === turn.action.playerId)
    if (!challengedPlayer) return true

    // Check if player has the claimed card
    const hasCard = challengedPlayer.influence.some(
      card => !card.isRevealed && card.type === turn.action.requiredCharacter
    )

    const challengeSucceeded = !hasCard

    // Handle the challenge resolution
    if (turn.challengingPlayer) {
      await this.handleChallengeResult(
        game.id,
        turn.action.playerId,
        turn.challengingPlayer,
        challengeSucceeded,
        turn.action.requiredCharacter
      )
    }

    return challengeSucceeded
  }

  async resolveBlockChallengeReveal(game: Game, turn: TurnState): Promise<boolean> {
    if (!turn.blockingPlayer || !turn.blockingCard || !turn.challengingPlayer) {
      return false
    }

    const blockingPlayer = game.players.find(p => p.id === turn.blockingPlayer)
    if (!blockingPlayer) return true

    // Check if blocking player has the claimed card
    const hasCard = blockingPlayer.influence.some(card => !card.isRevealed && card.type === turn.blockingCard)

    const challengeSucceeded = !hasCard

    // Handle the challenge resolution
    await this.handleChallengeResult(
      game.id,
      turn.blockingPlayer,
      turn.challengingPlayer,
      challengeSucceeded,
      turn.blockingCard
    )

    return challengeSucceeded
  }

  async handleChallengeResult(
    gameId: string,
    challengedPlayerId: string,
    challengingPlayerId: string,
    challengeSucceeded: boolean,
    revealedCardType: CardType
  ): Promise<void> {
    const gameRef = this.gamesRef.child(gameId)

    await gameRef.transaction(async (game: Game | null) => {
      if (!game) return null

      if (challengeSucceeded) {
        // Challenger won - challenged player loses influence
        await this.actionService.revealInfluence(gameId, challengedPlayerId)
      } else {
        // Challenger lost - they lose influence and challenged player replaces card
        await this.actionService.revealInfluence(gameId, challengingPlayerId)

        // Find and replace the challenged player's card
        const challengedPlayer = game.players.find(p => p.id === challengedPlayerId)
        if (!challengedPlayer) return game

        // Find the revealed card
        const cardIndex = challengedPlayer.influence.findIndex(
          card => !card.isRevealed && card.type === revealedCardType
        )
        if (cardIndex === -1) return game

        // Get the revealed card
        const revealedCard = challengedPlayer.influence[cardIndex]

        // Return the revealed card to deck and draw a new one
        await this.deckService.returnCardToDeck(gameId, revealedCard)
        const newCard = await this.deckService.drawCard(gameId)

        // Update the player's influence
        const updatedPlayers = game.players.map(player => {
          if (player.id === challengedPlayerId) {
            const updatedInfluence = [...player.influence]
            updatedInfluence[cardIndex] = newCard
            return { ...player, influence: updatedInfluence }
          }
          return player
        })

        return {
          ...game,
          players: updatedPlayers,
          updatedAt: Date.now()
        }
      }

      return game
    })
  }

  isValidChallenge(turn: TurnState, challengingPlayerId: string): boolean {
    // Can't challenge your own action
    if (challengingPlayerId === turn.action.playerId) {
      return false
    }

    // Can't challenge if already challenged
    if (turn.challengingPlayer) {
      return false
    }

    // Can't challenge if you've already responded
    if (turn.respondedPlayers?.includes(challengingPlayerId)) {
      return false
    }

    return true
  }

  async getRevealedCard(gameId: string, playerId: string, cardType: CardType): Promise<Card | null> {
    const snapshot = await this.gamesRef.child(`${gameId}/players/${playerId}/influence`).get()
    const influence = snapshot.val() as Card[]

    return influence.find(card => !card.isRevealed && card.type === cardType) || null
  }

  markChallengeResolved(turn: TurnState, challengingPlayerId: string, success: boolean): TurnState {
    return {
      ...turn,
      resolvedChallenges: {
        ...turn.resolvedChallenges,
        [challengingPlayerId]: success
      }
    }
  }
}
