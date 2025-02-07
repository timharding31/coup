import { Card, Game, Player } from '~/types'

export function prepareGameForClient(game: Game<'server' | 'client'>, playerId: string): Game<'client'> {
  const player = game.status === 'WAITING' ? null : game.players.find(p => p.id === playerId)
  return {
    ...game,
    deck: game.deck.map(card => prepareCardForClient(card, player)),
    players: game.players.map(p => ({ ...p, influence: p.influence.map(c => prepareCardForClient(c, player)) }))
  }
}

// The card's `type` should only be sent over the network if it's revealed or belongs to the player
function prepareCardForClient(card: Card<'server' | 'client'>, player: Player | null = null): Card<'client'> {
  if (!player) {
    return { ...card, type: null }
  }
  if (card.isRevealed) {
    return card
  }
  const playerCardIds = new Set(player.influence.map(c => c.id))
  if (playerCardIds.has(card.id)) {
    return card
  }
  return { ...card, type: null }
}
