import { Reference } from 'firebase-admin/database'
import { Card, CardType, Game, TurnState } from '~/types'
import { DeckService } from './deck.server'

export interface IChallengeService {
  // resolveChallengeReveal(game: Game, turn: TurnState): { successful: boolean; defendingCardId?: string }
  returnAndReplaceCard(gameId: string, playerId: string, card: Card): Promise<void>
  revealCard(gameId: string, playerId: string, card: Card): Promise<void>
}

export class ChallengeService implements IChallengeService {
  private gamesRef: Reference
  private deckService: DeckService

  constructor(gamesRef: Reference, deckService: DeckService) {
    this.gamesRef = gamesRef
    this.deckService = deckService
  }
  revealCard(gameId: string, playerId: string, card: Card): Promise<void> {
    throw new Error('Method not implemented.')
  }

  async returnAndReplaceCard(gameId: string, playerId: string, card: Card): Promise<void> {
    // Return card to deck
    const newDeck = await this.deckService.returnCardsToDeck(gameId, card)

    // Then draw a new card for the player
    const [dealtCards, remainingDeck] = this.deckService.dealCards(newDeck, 1)

    // Update the game state
    const result = await this.gamesRef.child(gameId).transaction((game: Game | null) => {
      if (!game) return game

      const updatedPlayers = game.players.map(p => {
        if (p.id !== playerId) return p
        return {
          ...p,
          influence: p.influence.concat(dealtCards)
        }
      })

      return {
        ...game,
        deck: remainingDeck,
        players: updatedPlayers,
        updatedAt: Date.now()
      }
    })

    if (!result.committed) {
      throw new Error('Failed to return and replace card')
    }
  }
}
