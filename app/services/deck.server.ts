import { Reference } from 'firebase-admin/database'
import { Card, CardType, Game } from '~/types'

export interface IDeckService {
  createInitialDeck(): Card[]
  dealCards(deck: Card[], count: number): [Card[], Card[]]
  returnCardToDeck(gameId: string, card: Card): Promise<Card[]>
  drawCard(gameId: string): Promise<Card>
  shuffleDeck(deck: Card[]): Card[]
}

export class DeckService implements IDeckService {
  private gamesRef: Reference

  constructor(gamesRef: Reference) {
    this.gamesRef = gamesRef
  }

  createInitialDeck(): Card[] {
    const cardTypes = [CardType.DUKE, CardType.ASSASSIN, CardType.CONTESSA, CardType.CAPTAIN, CardType.AMBASSADOR]

    // Create 3 copies of each card type
    const deck = cardTypes.flatMap(type =>
      Array(3)
        .fill(null)
        .map(() => ({
          id: crypto.randomUUID(),
          type,
          isRevealed: false
        }))
    )

    return this.shuffleDeck(deck)
  }

  dealCards(deck: Card[], count: number): [Card[], Card[]] {
    if (deck.length < count) {
      throw new Error('Not enough cards in deck')
    }

    const dealt = deck.slice(0, count)
    const remaining = deck.slice(count)
    return [dealt, remaining]
  }

  async returnCardToDeck(gameId: string, card: Card): Promise<Card[]> {
    const gameRef = this.gamesRef.child(gameId)

    const result = await gameRef.transaction((game: Game | null) => {
      if (!game) return null

      // Reset the card state
      const returnedCard = {
        ...card,
        isRevealed: false
      }

      // Remove from player's hand
      const updatedPlayers = game.players.map(player => {
        const cardIndex = player.influence.findIndex(c => c.id === card.id)
        if (cardIndex === -1) return player
        return {
          ...player,
          influence: player.influence.filter(c => c.id !== card.id)
        }
      })

      // Add card to deck and shuffle
      const updatedDeck = this.shuffleDeck([...game.deck, returnedCard])

      return {
        ...game,
        deck: updatedDeck,
        players: updatedPlayers,
        updatedAt: Date.now()
      }
    })

    if (!result.committed || !result.snapshot.exists()) {
      throw new Error('Failed to return card to deck')
    }

    return result.snapshot.val().deck as Card[]
  }

  async drawCard(gameId: string): Promise<Card> {
    const gameRef = this.gamesRef.child(gameId)
    let card: Card | undefined

    const result = await gameRef.transaction(game => {
      if (!game || game.deck.length === 0) return null

      // Draw the top card
      const [drawnCard, ...remainingDeck] = game.deck
      card = drawnCard
      return {
        ...game,
        deck: remainingDeck,
        updatedAt: Date.now()
      }
    })

    if (!result.committed || !result.snapshot.exists() || !card) {
      throw new Error('Failed to draw card')
    }

    return card
  }

  shuffleDeck(deck: Card[]): Card[] {
    // Fisher-Yates shuffle algorithm
    const shuffled = [...deck]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  async validateCardInHand(gameId: string, playerId: string, cardType: CardType): Promise<boolean> {
    const snapshot = await this.gamesRef.child(`${gameId}/players/${playerId}/influence`).get()
    const influence = snapshot.val() as Card[]

    return influence.some(card => !card.isRevealed && card.type === cardType)
  }
}
