import { Action, ActionType, CardType, Game, Player, TargetedActionType, UntargetedActionType } from '~/types'
import { db } from './firebase.server'
import { Reference } from 'firebase-admin/database'

// type RobotResponse<T> = Promise<T & { memory: Record<string, any> }>

interface ICoupRobot {
  decideAction(): Promise<{ action: Action }>
  decideResponse(): Promise<
    { response: 'accept' | 'challenge'; blockCard?: never } | { response: 'block'; blockCard: CardType }
  >
  decideCardSelection(): Promise<{ cardId: string }>
  decideExchangeCards(): Promise<{ cardIds: string[] }>
}

// Type to track observed player actions and inferred cards
interface PlayerCardInference {
  playerId: string
  cardProbabilities: {
    [key in CardType]: number // 0-1 probability of having this card
  }
  revealedCards: CardType[]
  lastActions: {
    type: ActionType
    blockCard: CardType | null
    timestamp: number
  }[]
}

export class CoupRobot implements ICoupRobot {
  static readonly USERNAMES = [
    'Slider',
    'Boomer',
    'Stinger',
    'Outlaw',
    'Rocket',
    'Chipper',
    'Dude',
    'Poncho',
    'Hog',
    'Maverick',
    'Sultan',
    'Rex',
    'Bandit',
    'Goose',
    'Jester',
    'Samara',
    'Tex',
    'Iceman',
    'Buzz',
    'Storm',
    'Thunder',
    'Fury',
    'Gerwin',
    'Blaze',
    'Ace',
    'Swabbie',
    'Swift',
    'Drift',
    'Boost',
    'Turbo',
    'Flash',
    'Rapid',
    'Nitro',
    'Zoom',
    'Sonic',
    'Bolt',
    'Lightning',
    'Speedy',
    'Rush',
    'Dash',
    'Quick',
    'Zippy',
    'Viper',
    'Comet',
    'Yuri',
    'Tusk',
    'Junior',
    'Scout',
    'Echo',
    'Apex',
    'Titan',
    'Beast',
    'Alpha',
    'Omega',
    'Heater',
    'Striker',
    'Hunter',
    'Knight',
    'Jet',
    'Raider',
    'Ridge',
    'Phoenix',
    'Bomber',
    'Eagle',
    'Hawk',
    'Mercury',
    'Orion',
    'Vulcan',
    'Joker',
    'Scrap',
    'Steel',
    'Torque',
    'Driver',
    'Spike',
    'Savage',
    'Rampage',
    'Rebel',
    'Rogue',
    'Shark',
    'Wolf',
    'Cobra',
    'Panther',
    'Tiger',
    'Dragon',
    'Flame',
    'Shadow',
    'Ghost',
    'Phantom',
    'Demon',
    'Angel',
    'Reaper',
    'Havoc',
    'Chaos',
    'Cyclone',
    'Typhoon',
    'Hurricane',
    'Tsunami',
    'Quake',
    'Tremor',
    'Mountain',
    'Canyon',
    'River',
    'Ocean',
    'Star'
  ]

  private readonly botsRef: Reference = db.ref('bots')
  private memoryRef: Reference
  private player: Player
  private game: Game
  // Map of player ID to their card inferences
  private playerInferences: Map<string, PlayerCardInference> = new Map()
  // Cards the bot has seen during exchange actions
  private exchangeSeenCards: Set<CardType> = new Set()
  // Count of each card type known to be revealed/seen
  private knownCardCounts: Map<CardType, number> = new Map()

  private constructor(player: Player, game: Game) {
    this.player = player
    this.game = game
    this.memoryRef = this.botsRef.child(`${game.id}/${player.id}`)
  }

  static async create(player: Player, game: Game): Promise<CoupRobot> {
    const bot = new CoupRobot(player, game)
    return bot.initMemory()
  }

  static isBotPlayer(player: Player | null = null): boolean {
    return !!player?.id.startsWith('bot-')
  }

  static isBotGame(game: Game | null = null): boolean {
    return !!game?.players.some(p => p.id.startsWith('bot-'))
  }

  static getRandomUsername(existingBots: string[] = []): string {
    let n = 0
    while (n < 10) {
      const username = CoupRobot.USERNAMES[Math.floor(Math.random() * CoupRobot.USERNAMES.length)]
      if (!existingBots.includes(username)) return username
      n++
    }
    throw new Error('Failed to generate bot username')
  }

  /**
   * Load bot memory from the game's metadata
   * This restores the bot's knowledge about cards and player inferences
   */
  private async initMemory(): Promise<CoupRobot> {
    // First initialize with default values
    this.initializeInferences()
    this.initializeKnownCardCounts()

    // Then try to load saved memory if it exists
    const snapshot = await this.memoryRef.get()
    const memory = snapshot.val() as Record<string, any> | null

    if (memory) {
      try {
        // Restore player inferences
        if (memory.playerInferences) {
          this.playerInferences = new Map(
            Object.entries(memory.playerInferences).map(([id, data]) => [id, data as PlayerCardInference])
          )
        }

        // Restore exchange seen cards
        if (memory.exchangeSeenCards) {
          this.exchangeSeenCards = new Set(memory.exchangeSeenCards)
        }

        // Restore known card counts
        if (memory.knownCardCounts) {
          this.knownCardCounts = new Map(
            Object.entries(memory.knownCardCounts).map(([type, count]) => [type as CardType, count as number])
          )
        }
      } catch (error) {
        console.error('Error loading bot memory:', error)
        // If there's an error, reinitialize everything
        this.initializeInferences()
        this.initializeKnownCardCounts()
      }
    }

    return this
  }

  /**
   * Save bot memory to be stored in the game's metadata
   * This preserves the bot's knowledge between turns
   */
  private async saveBotMemory(): Promise<void> {
    const memory = {
      playerInferences: Object.fromEntries(this.playerInferences.entries()),
      exchangeSeenCards: Array.from(this.exchangeSeenCards),
      knownCardCounts: Object.fromEntries(this.knownCardCounts.entries())
    }
    await this.memoryRef.transaction(prev => ({ ...prev, ...memory }))
  }

  /**
   * Initialize inference tracking for all players
   */
  private initializeInferences(): void {
    // Track information about all players except self
    this.game.players.forEach(player => {
      if (player.id !== this.player.id) {
        const revealedCards: CardType[] = []

        // Record any already revealed cards
        player.influence.forEach(card => {
          if (card.isRevealed && card.type) {
            revealedCards.push(card.type)
          }
        })

        this.playerInferences.set(player.id, {
          playerId: player.id,
          // Start with equal probabilities for all card types
          cardProbabilities: {
            [CardType.DUKE]: 0.2,
            [CardType.ASSASSIN]: 0.2,
            [CardType.CONTESSA]: 0.2,
            [CardType.CAPTAIN]: 0.2,
            [CardType.AMBASSADOR]: 0.2
          },
          revealedCards,
          lastActions: []
        })

        // Explicitly record each revealed card to update probabilities and counts
        revealedCards.forEach(cardType => {
          this.recordRevealedCard(player.id, cardType)
        })
      }
    })
  }

  /**
   * Initialize counts of known cards
   */
  private initializeKnownCardCounts(): void {
    // Start with empty counts
    Object.values(CardType).forEach(cardType => {
      this.knownCardCounts.set(cardType, 0)
    })

    // Count bot's own cards
    this.player.influence.forEach(card => {
      if (card.type) {
        this.incrementKnownCardCount(card.type)
      }
    })

    // Count all revealed cards from other players
    this.game.players.forEach(player => {
      player.influence.forEach(card => {
        if (card.isRevealed && card.type) {
          this.incrementKnownCardCount(card.type)
        }
      })
    })
  }

  /**
   * Increment the count of a known card type
   */
  private incrementKnownCardCount(cardType: CardType): void {
    const MAX_CARD_COUNT = 3 // Maximum 3 of each card type in the deck
    const currentCount = this.knownCardCounts.get(cardType) || 0

    // Make sure we don't exceed the maximum possible count
    if (currentCount < MAX_CARD_COUNT) {
      this.knownCardCounts.set(cardType, currentCount + 1)
    }
  }

  /**
   * Add a card type to the exchange seen cards
   */
  private addExchangeSeenCard(cardType: CardType): void {
    this.exchangeSeenCards.add(cardType)
    this.incrementKnownCardCount(cardType)
  }

  /**
   * Update player inferences based on an action they took
   */
  private updatePlayerInference(playerId: string, actionType: ActionType, blockCard?: CardType): void {
    const inference = this.playerInferences.get(playerId)
    if (!inference) return

    // Record this action
    inference.lastActions = (inference.lastActions || []).concat({
      type: actionType,
      blockCard: blockCard || null,
      timestamp: Date.now()
    })

    // Limit history to last 10 actions
    if (inference.lastActions.length > 10) {
      inference.lastActions.shift()
    }

    // Update probabilities based on action
    const probabilities = inference.cardProbabilities

    // Actions that strongly suggest having specific cards
    switch (actionType) {
      case 'TAX':
        // Likely has DUKE
        probabilities[CardType.DUKE] = Math.min(1, probabilities[CardType.DUKE] + 0.4)
        break
      case 'ASSASSINATE':
        // Likely has ASSASSIN
        probabilities[CardType.ASSASSIN] = Math.min(1, probabilities[CardType.ASSASSIN] + 0.4)
        break
      case 'STEAL':
        // Likely has CAPTAIN
        probabilities[CardType.CAPTAIN] = Math.min(1, probabilities[CardType.CAPTAIN] + 0.4)
        break
      case 'EXCHANGE':
        // Likely has AMBASSADOR
        probabilities[CardType.AMBASSADOR] = Math.min(1, probabilities[CardType.AMBASSADOR] + 0.4)
        break
    }

    // If they successfully blocked with a card
    if (blockCard) {
      switch (blockCard) {
        case CardType.DUKE:
          probabilities[CardType.DUKE] = Math.min(1, probabilities[CardType.DUKE] + 0.4)
          break
        case CardType.CONTESSA:
          probabilities[CardType.CONTESSA] = Math.min(1, probabilities[CardType.CONTESSA] + 0.4)
          break
        case CardType.CAPTAIN:
          probabilities[CardType.CAPTAIN] = Math.min(1, probabilities[CardType.CAPTAIN] + 0.4)
          break
        case CardType.AMBASSADOR:
          probabilities[CardType.AMBASSADOR] = Math.min(1, probabilities[CardType.AMBASSADOR] + 0.4)
          break
      }
    }

    // Normalize probabilities
    this.playerInferences.set(playerId, inference)
  }

  /**
   * Record a revealed card for a player
   */
  private recordRevealedCard(playerId: string, cardType: CardType): void {
    const inference = this.playerInferences.get(playerId)
    if (!inference) return

    inference.revealedCards = inference.revealedCards || []

    if (!inference.revealedCards.includes(cardType)) {
      inference.revealedCards.push(cardType)

      // Update the known card count
      this.incrementKnownCardCount(cardType)

      // Reset probability for this card type to 0
      inference.cardProbabilities[cardType] = 0

      this.playerInferences.set(playerId, inference)
    }
  }

  /**
   * Check if a card type is likely to be caught in a bluff
   * based on what we know about revealed cards
   */
  private isRiskyBluff(cardType: CardType): boolean {
    // The deck has 3 of each card type
    const MAX_CARD_COUNT = 3

    // Get the count of revealed cards of this type that we know about
    // Normalize to ensure we don't exceed maximum possible
    const knownCount = Math.min(this.knownCardCounts.get(cardType) || 0, MAX_CARD_COUNT)

    // If we've seen all 3 copies of this card, it's definitely risky
    if (knownCount >= MAX_CARD_COUNT) {
      return true
    }

    // If we've seen 2 copies and don't have it ourselves, it's somewhat risky
    if (knownCount === MAX_CARD_COUNT - 1 && !this.playerHasCard(this.player, cardType)) {
      return true
    }

    return false
  }

  /**
   * Check if a player has a specific card
   */
  private playerHasCard(player: Player, cardType: CardType): boolean {
    return player.influence.some(card => !card.isRevealed && card.type === cardType)
  }

  /**
   * Estimate likelihood an opponent has a specific card based on inferences
   */
  private estimateCardProbability(playerId: string, cardType: CardType): number {
    const inference = this.playerInferences.get(playerId)
    if (!inference) return 0.2 // Default equal probability

    return inference.cardProbabilities[cardType]
  }

  /**
   * Check if it's safe to challenge an opponent's action
   */
  private isSafeToChallengeAction(action: Action): boolean {
    if (!action.requiredCharacter) return false

    const cardType = action.requiredCharacter
    const playerId = action.playerId

    // Don't challenge if the card isn't being tracked
    if (!this.knownCardCounts.has(cardType)) return false

    // If we've seen all 3 copies of this card, very safe to challenge
    if (this.knownCardCounts.get(cardType) === 3) {
      return true
    }

    // If probability they have the card is low, might be safe to challenge
    if (this.estimateCardProbability(playerId, cardType) < 0.3) {
      return Math.random() < 0.7 // 70% chance to challenge if we think they're bluffing
    }

    return false
  }

  /**
   * Scan the game for any revealed cards that we might have missed
   */
  private scanGameForRevealedCards(): void {
    // Check all players for revealed cards
    this.game.players.forEach(player => {
      if (player.id !== this.player.id) {
        player.influence.forEach(card => {
          if (card.isRevealed && card.type) {
            // Make sure this card is recorded
            this.recordRevealedCard(player.id, card.type)
          }
        })
      }
    })
  }

  /**
   * Decide what action to take on the robot's turn
   */
  async decideAction(): Promise<{ action: Action }> {
    // Update our knowledge of the game state by scanning for newly revealed cards
    this.scanGameForRevealedCards()

    // If player has 10+ coins, must coup
    let action: Action

    if (this.player.coins >= 10) {
      action = this.decideCoupTarget()
    } else {
      // Get the weighted actions based on strategic considerations
      const weightedActions = this.getWeightedActions()

      // Choose an action based on weights
      let totalWeight = 0
      for (const { weight } of weightedActions) {
        totalWeight += weight
      }

      let randomValue = Math.random() * totalWeight
      let chosenAction: ActionType | null = null

      for (const { action, weight } of weightedActions) {
        randomValue -= weight
        if (randomValue <= 0) {
          chosenAction = action
          break
        }
      }

      // Fallback to INCOME if something went wrong
      if (!chosenAction) {
        chosenAction = 'INCOME'
      }

      // If it's a targeted action, choose a target
      if (['COUP', 'ASSASSINATE', 'STEAL'].includes(chosenAction)) {
        if (chosenAction === 'COUP') {
          action = this.decideCoupTarget()
        } else if (chosenAction === 'ASSASSINATE') {
          action = this.decideAssassinateTarget()
        } else if (chosenAction === 'STEAL') {
          action = this.decideStealTarget()
        } else {
          // Fallback to income if something went wrong
          action = this.buildAction('INCOME')
        }
      } else {
        // For untargeted actions, build the action
        action = this.buildAction(chosenAction as UntargetedActionType)
      }
    }

    // Save bot's memory to persist its knowledge
    await this.saveBotMemory()

    return { action }
  }

  /**
   * Get weighted actions based on strategy and card inferences
   */
  private getWeightedActions(): Array<{ action: ActionType; weight: number }> {
    const weightedActions: Array<{ action: ActionType; weight: number }> = []
    const availableActions = this.getAvailableActions()

    // Base weights for each action type
    const baseWeights: Record<ActionType, number> = {
      INCOME: 1,
      FOREIGN_AID: 2,
      TAX: 3,
      EXCHANGE: 2,
      STEAL: 2.5,
      ASSASSINATE: 3,
      COUP: 4
    }

    // Adjust weights based on strategic considerations
    for (const action of availableActions) {
      let weight = baseWeights[action] || 1

      // Adjust based on having the required card or not
      if (['TAX', 'EXCHANGE', 'STEAL', 'ASSASSINATE'].includes(action)) {
        const requiredCard =
          action === 'TAX'
            ? CardType.DUKE
            : action === 'EXCHANGE'
              ? CardType.AMBASSADOR
              : action === 'STEAL'
                ? CardType.CAPTAIN
                : CardType.ASSASSIN

        // Increase weight if we actually have the card
        if (this.playerHasCard(this.player, requiredCard)) {
          weight *= 2
        } else {
          // Check if bluffing this card is too risky
          if (this.isRiskyBluff(requiredCard)) {
            weight *= 0.1 // Heavily discourage this action
          }
        }
      }

      // Specific action adjustments
      switch (action) {
        case 'INCOME':
          // Safer but less efficient
          if (this.player.coins < 3) {
            weight *= 1.5 // More appealing when we have few coins
          }
          break

        case 'FOREIGN_AID':
          // Check likelihood of opponents having DUKE to block
          let dukeRisk = 0
          this.playerInferences.forEach(inference => {
            dukeRisk += inference.cardProbabilities[CardType.DUKE]
          })

          // If high chance someone will block with Duke, reduce appeal
          if (dukeRisk > 0.7) {
            weight *= 0.7
          }
          break

        case 'EXCHANGE':
          // More valuable if we need to find specific cards
          if (this.player.coins < 3 || this.player.influence.length === 1) {
            weight *= 1.5
          }
          break

        case 'ASSASSINATE':
          // More valuable late game
          if (this.game.players.filter(p => p.influence.some(c => !c.isRevealed)).length <= 3) {
            weight *= 1.5
          }

          // Check if likely to be blocked by CONTESSA
          let contessaRisk = 0
          this.playerInferences.forEach(inference => {
            contessaRisk += inference.cardProbabilities[CardType.CONTESSA]
          })

          if (contessaRisk > 0.7) {
            weight *= 0.6
          }
          break

        case 'COUP':
          // Always highest priority if affordable
          if (this.player.coins >= 7) {
            weight *= 2
          }
          break
      }

      weightedActions.push({ action, weight })
    }

    return weightedActions
  }

  /**
   * Decide how to respond to another player's action
   */
  async decideResponse(): Promise<
    { response: 'accept' | 'challenge'; blockCard?: never } | { response: 'block'; blockCard: CardType }
  > {
    const { phase, action } = this.game.currentTurn || {}
    if (!phase || !action) {
      throw new Error('Invalid game state')
    }

    // Update our knowledge of the game state by scanning for newly revealed cards
    this.scanGameForRevealedCards()

    // Track the action for future inferences
    if (action.playerId !== this.player.id) {
      this.updatePlayerInference(action.playerId, action.type)

      // Check for revealed cards in the game state
      if (this.game.currentTurn?.challengeResult?.defenseSuccessful === false) {
        // Someone failed a challenge - record their revealed card
        const lostCardId = this.game.currentTurn.challengeResult.lostCardId
        if (lostCardId) {
          // Find which player lost the card and what type it was
          for (const player of this.game.players) {
            const revealedCard = player.influence.find(card => card.id === lostCardId && card.isRevealed && card.type)

            if (revealedCard && revealedCard.type) {
              this.recordRevealedCard(player.id, revealedCard.type)
              break
            }
          }
        }
      }
    }

    let response: 'accept' | 'challenge' | 'block' = 'accept'
    let blockCard: CardType | undefined

    if (phase === 'AWAITING_OPPONENT_RESPONSES') {
      // If this is a blockable action and it targets the bot, consider blocking
      if (action.canBeBlocked && (action.targetPlayerId === this.player.id || action.type === 'FOREIGN_AID')) {
        // Check if bot has a legitimate blocking card
        const blockableBy = action.blockableBy
        const legitBlockCards = blockableBy.filter(cardType => this.playerHasCard(this.player, cardType))

        if (legitBlockCards.length > 0) {
          // Always block with a card we actually have
          response = 'block'
          blockCard = legitBlockCards[0]
        } else if (blockableBy.length > 0) {
          // Consider bluffing a block
          // Assess risk of being challenged on the bluff
          const possibleBlockCard = blockableBy[0] // Take first blockable card

          // Only bluff if it's not too risky
          if (!this.isRiskyBluff(possibleBlockCard) && Math.random() < 0.6) {
            response = 'block'
            blockCard = possibleBlockCard
          }
        }
      }

      // If action can be challenged, assess if it's a good idea
      if (action.canBeChallenged && action.requiredCharacter) {
        // Check if it's safe to challenge based on card knowledge
        if (this.isSafeToChallengeAction(action)) {
          response = 'challenge'
        }
      }
    } else if (phase === 'AWAITING_ACTIVE_RESPONSE_TO_BLOCK') {
      // If our action was blocked, decide whether to challenge the block
      if (action.playerId === this.player.id) {
        const blocker = this.game.currentTurn?.opponentResponses
        if (blocker && 'claimedCard' in blocker) {
          const blockCard = blocker.claimedCard!
          const blockerId = blocker.block!

          // If we know they're bluffing (e.g., all 3 cards are revealed/known), challenge
          if (this.knownCardCounts.get(blockCard) === 3) {
            response = 'challenge'
          }

          // If we estimate low probability they have the card, consider challenging
          else if (this.estimateCardProbability(blockerId, blockCard) < 0.4) {
            response = 'challenge'
          }
        }
      }
    } else if (phase === 'AWAITING_TARGET_BLOCK_RESPONSE') {
      // If we've been targeted and the actor already defended a challenge, decide whether to block the actor
      if (action.canBeBlocked && action.targetPlayerId === this.player.id) {
        const blockableBy = action.blockableBy
        const legitBlockCards = blockableBy.filter(cardType => this.playerHasCard(this.player, cardType))

        if (legitBlockCards.length > 0) {
          // Always block with a card we actually have
          response = 'block'
          blockCard = legitBlockCards[0]
        } else if (blockableBy.length > 0) {
          // Consider bluffing a block
          // Assess risk of being challenged on the bluff
          const possibleBlockCard = blockableBy[0] // Take first blockable card

          // Only bluff if it's not too risky
          if (!this.isRiskyBluff(possibleBlockCard) && Math.random() < 0.6) {
            response = 'block'
            blockCard = possibleBlockCard
          }
        }
      }
    }

    // Save bot memory after making a decision
    await this.saveBotMemory()

    switch (response) {
      case 'accept':
      case 'challenge':
        return { response }

      case 'block':
        if (!blockCard) {
          throw new Error('Cannot block without claiming a card')
        }
        return { response: 'block', blockCard }
    }
  }

  /**
   * Choose which card to select when the bot needs to lose influence or reveal a card
   */
  async decideCardSelection(): Promise<{ cardId: string }> {
    const phase = this.game.currentTurn?.phase
    if (!phase) {
      throw new Error('No current turn phase')
    }

    const unrevealedCards = this.player.influence.filter(card => !card.isRevealed)

    if (unrevealedCards.length === 0) {
      console.error('No cards available to select')
      throw new Error('No cards available to select')
    }

    let selectedCardId: string

    // If this is a challenge defense phase and we have the claimed card, use it
    if (
      (phase === 'AWAITING_ACTOR_DEFENSE' || phase === 'AWAITING_BLOCKER_DEFENSE') &&
      this.game.currentTurn?.challengeResult?.challengedCaracter
    ) {
      const challengedCardType = this.game.currentTurn.challengeResult.challengedCaracter

      const defenseCard = unrevealedCards.find(card => card.type === challengedCardType)

      if (defenseCard) {
        selectedCardId = defenseCard.id
      } else {
        // If we don't have the claimed card, select a random card
        const randomIndex = Math.floor(Math.random() * unrevealedCards.length)
        selectedCardId = unrevealedCards[randomIndex].id
      }
    }
    // If losing a card due to assassination, coup, or failed challenge
    else if (phase === 'AWAITING_TARGET_SELECTION' || phase === 'AWAITING_CHALLENGE_PENALTY_SELECTION') {
      // Evaluate current game state to determine optimal card to keep
      const gameStateAnalysis = this.analyzeGameState()

      // Priority order based on game state
      const cardPriorities: Record<CardType, number> = {
        DUKE: 3, // Tax ability is valuable
        ASSASSIN: 2, // Attack ability
        CAPTAIN: 2, // Stealing is good
        CONTESSA: 1, // Only blocks assassination
        AMBASSADOR: 1 // Exchange is situational
      }

      // Adjust priorities based on game state
      if (gameStateAnalysis.manyAssassins) {
        cardPriorities[CardType.CONTESSA] += 2 // Contessa becomes more valuable
      }

      if (gameStateAnalysis.lowCoins) {
        cardPriorities[CardType.DUKE] += 1 // Duke becomes more valuable
        cardPriorities[CardType.CAPTAIN] += 1 // Captain becomes more valuable
      }

      if (gameStateAnalysis.lateGame) {
        cardPriorities[CardType.ASSASSIN] += 1 // Offensive cards more valuable
      }

      // Sort by adjusted priority (lowest first - these are the ones we'll lose)
      unrevealedCards.sort((a, b) => {
        const priorityA = a.type ? cardPriorities[a.type as CardType] || 0 : 0
        const priorityB = b.type ? cardPriorities[b.type as CardType] || 0 : 0
        return priorityA - priorityB
      })

      selectedCardId = unrevealedCards[0].id
    } else {
      // For other cases, choose a random card
      const randomIndex = Math.floor(Math.random() * unrevealedCards.length)
      selectedCardId = unrevealedCards[randomIndex].id
    }

    // Update our knowledge after revealing a card
    const selectedCard = unrevealedCards.find(card => card.id === selectedCardId)
    if (selectedCard?.type) {
      // Record that this card is now revealed
      this.incrementKnownCardCount(selectedCard.type)

      // If we're a target, we need to track which of our cards are revealed
      if (
        phase === 'AWAITING_TARGET_SELECTION' ||
        phase === 'AWAITING_CHALLENGE_PENALTY_SELECTION' ||
        phase === 'AWAITING_ACTOR_DEFENSE' ||
        phase === 'AWAITING_BLOCKER_DEFENSE'
      ) {
        // Record that our own card is revealed - this affects future decision making
        this.recordRevealedCard(this.player.id, selectedCard.type)
      }
    }

    // Save memory after making a decision
    await this.saveBotMemory()

    return { cardId: selectedCardId }
  }

  /**
   * Analyze current game state for strategic decisions
   */
  private analyzeGameState() {
    const result = {
      lateGame: false,
      manyAssassins: false,
      lowCoins: this.player.coins < 3,
      opponentsWithContessa: 0
    }

    // Check if it's late game (few players with influence left)
    const activePlayers = this.game.players.filter(p => p.influence.some(c => !c.isRevealed)).length

    result.lateGame = activePlayers <= 3

    // Check for revealed assassins and contessas
    let revealedAssassins = 0

    this.playerInferences.forEach(inference => {
      // Count revealed assassins
      if (inference.revealedCards?.includes(CardType.ASSASSIN)) {
        revealedAssassins++
      }

      // Count players likely to have contessa
      if (inference.cardProbabilities[CardType.CONTESSA] > 0.6) {
        result.opponentsWithContessa++
      }
    })

    // Check if many assassins are in play or revealed
    result.manyAssassins = revealedAssassins > 0 || this.player.influence.some(c => c.type === CardType.ASSASSIN)

    return result
  }

  /**
   * Choose which cards to keep after an exchange
   */
  async decideExchangeCards(): Promise<{ cardIds: string[] }> {
    const eligibleCards = this.player.influence.filter(card => !card.isRevealed)
    const gameState = this.analyzeGameState()

    // Record all cards we see during the exchange
    eligibleCards.forEach(card => {
      if (card.type) {
        // Track that we've seen this card
        this.addExchangeSeenCard(card.type)
      }
    })

    // Assign each card a score based on its value in the current game state
    const cardScores: Map<string, number> = new Map()

    for (const card of eligibleCards) {
      if (!card.type) continue

      let score = 0

      // Base scores by card type
      switch (card.type) {
        case CardType.DUKE:
          score = 8
          if (gameState.lowCoins) score += 3
          break
        case CardType.ASSASSIN:
          score = 7
          if (gameState.lateGame) score += 3
          if (gameState.opponentsWithContessa > 1) score -= 2
          break
        case CardType.CAPTAIN:
          score = 7
          if (gameState.lowCoins) score += 2
          break
        case CardType.CONTESSA:
          score = 5
          if (gameState.manyAssassins) score += 4
          break
        case CardType.AMBASSADOR:
          score = 5
          // Less valuable in late game
          if (gameState.lateGame) score -= 2
          break
      }

      // Penalize duplicates
      const duplicateCount = eligibleCards.filter(c => c.type === card.type).length
      if (duplicateCount > 1) {
        score -= 3
      }

      cardScores.set(card.id, score)
    }

    // Sort cards by score (highest first)
    const sortedCards = [...eligibleCards]
      .sort((a, b) => {
        const scoreA = cardScores.get(a.id) || 0
        const scoreB = cardScores.get(b.id) || 0
        return scoreB - scoreA
      })
      .map(card => card.id)

    // Keep the top 2 cards (or fewer if we don't have 2)
    const selectedCards = sortedCards.slice(0, 2)

    // Save memory after making a decision
    await this.saveBotMemory()

    return { cardIds: selectedCards }
  }

  /**
   * Helper method to get available actions based on player's coins
   */
  private getAvailableActions(): Array<ActionType> {
    const availableActions: Array<UntargetedActionType | TargetedActionType> = []

    // Always available
    availableActions.push('INCOME')

    // Check if foreign aid is reasonable
    availableActions.push('FOREIGN_AID')

    // Character-based actions - check if we have the cards or if bluffing is reasonable
    const playerCards = this.player.influence.filter(c => !c.isRevealed).map(c => c.type)

    // TAX (Duke)
    if (playerCards.includes(CardType.DUKE) || !this.isRiskyBluff(CardType.DUKE)) {
      availableActions.push('TAX')
    }

    // EXCHANGE (Ambassador)
    if (playerCards.includes(CardType.AMBASSADOR) || !this.isRiskyBluff(CardType.AMBASSADOR)) {
      availableActions.push('EXCHANGE')
    }

    // STEAL (Captain)
    const stealTargets = this.game.players.filter(
      p => p.id !== this.player.id && p.coins > 0 && p.influence.some(card => !card.isRevealed)
    )
    if (stealTargets.length > 0 && (playerCards.includes(CardType.CAPTAIN) || !this.isRiskyBluff(CardType.CAPTAIN))) {
      availableActions.push('STEAL')
    }

    // ASSASSINATE (Assassin)
    const assassinateTargets = this.game.players.filter(
      p => p.id !== this.player.id && p.influence.some(card => !card.isRevealed)
    )
    if (
      this.player.coins >= 3 &&
      assassinateTargets.length > 0 &&
      (playerCards.includes(CardType.ASSASSIN) || !this.isRiskyBluff(CardType.ASSASSIN))
    ) {
      availableActions.push('ASSASSINATE')
    }

    // Check if coup is affordable
    if (this.player.coins >= 7) {
      availableActions.push('COUP')
    }

    return availableActions
  }

  /**
   * Helper to create a coup action targeting the strongest opponent
   */
  private decideCoupTarget(): Action {
    // Target the player with the most unrevealed cards, breaking ties with most coins
    const validTargets = this.game.players.filter(
      p => p.id !== this.player.id && p.influence.some(card => !card.isRevealed)
    )

    if (validTargets.length === 0) {
      throw new Error('No valid targets for coup')
    }

    // Sort by threat level (unrevealed cards, then coins, then card strength)
    validTargets.sort((a, b) => {
      const aCards = a.influence.filter(c => !c.isRevealed).length
      const bCards = b.influence.filter(c => !c.isRevealed).length

      // First prioritize players with more cards
      if (aCards !== bCards) {
        return bCards - aCards // More cards = higher threat
      }

      // Then prioritize players with more coins
      if (a.coins !== b.coins) {
        return b.coins - a.coins // More coins = higher threat
      }

      // Finally consider inferred card strength
      const aInference = this.playerInferences.get(a.id)
      const bInference = this.playerInferences.get(b.id)

      if (aInference && bInference) {
        // Calculate threat score based on card probabilities
        const aThreat =
          aInference.cardProbabilities[CardType.DUKE] * 3 +
          aInference.cardProbabilities[CardType.ASSASSIN] * 3 +
          aInference.cardProbabilities[CardType.CAPTAIN] * 2 +
          aInference.cardProbabilities[CardType.CONTESSA] * 1 +
          aInference.cardProbabilities[CardType.AMBASSADOR] * 1

        const bThreat =
          bInference.cardProbabilities[CardType.DUKE] * 3 +
          bInference.cardProbabilities[CardType.ASSASSIN] * 3 +
          bInference.cardProbabilities[CardType.CAPTAIN] * 2 +
          bInference.cardProbabilities[CardType.CONTESSA] * 1 +
          bInference.cardProbabilities[CardType.AMBASSADOR] * 1

        return bThreat - aThreat // Higher threat score = higher priority
      }

      return 0
    })

    // Return a coup action targeting the highest threat
    return {
      type: 'COUP',
      playerId: this.player.id,
      targetPlayerId: validTargets[0].id,
      coinCost: 7,
      canBeBlocked: false,
      canBeChallenged: false,
      blockableBy: []
    }
  }

  /**
   * Helper to create an assassinate action
   */
  private decideAssassinateTarget(): Action {
    const validTargets = this.game.players.filter(
      p => p.id !== this.player.id && p.influence.some(card => !card.isRevealed)
    )

    if (validTargets.length === 0) {
      throw new Error('No valid targets for assassination')
    }

    // Sort targets by strategic priority
    const rankedTargets = [...validTargets].sort((a, b) => {
      let aScore = 0
      let bScore = 0

      // Check for Contessa
      const aInference = this.playerInferences.get(a.id)
      const bInference = this.playerInferences.get(b.id)

      // Lower score for players likely to have Contessa
      if (aInference && aInference.cardProbabilities[CardType.CONTESSA] > 0.6) {
        aScore -= 5
      }

      if (bInference && bInference.cardProbabilities[CardType.CONTESSA] > 0.6) {
        bScore -= 5
      }

      // Higher score for players with more coins (they're a threat)
      aScore += a.coins
      bScore += b.coins

      // Higher score for players with more cards
      aScore += a.influence.filter(c => !c.isRevealed).length * 3
      bScore += b.influence.filter(c => !c.isRevealed).length * 3

      return bScore - aScore
    })

    // Get the best target
    const target = rankedTargets[0]

    return {
      type: 'ASSASSINATE',
      playerId: this.player.id,
      targetPlayerId: target.id,
      requiredCharacter: CardType.ASSASSIN,
      coinCost: 3,
      canBeBlocked: true,
      canBeChallenged: true,
      blockableBy: [CardType.CONTESSA]
    }
  }

  /**
   * Helper to create a steal action
   */
  private decideStealTarget(): Action {
    // Prioritize players with the most coins, but also consider if they might block
    const validTargets = this.game.players.filter(
      p => p.id !== this.player.id && p.coins > 0 && p.influence.some(card => !card.isRevealed)
    )

    if (validTargets.length === 0) {
      throw new Error('No valid targets for stealing')
    }

    // Sort by strategic priority
    const rankedTargets = [...validTargets].sort((a, b) => {
      let aScore = a.coins * 2 // Base score is coins × 2
      let bScore = b.coins * 2

      const aInference = this.playerInferences.get(a.id)
      const bInference = this.playerInferences.get(b.id)

      // Reduce score for players likely to have Captain or Ambassador (can block)
      if (aInference) {
        aScore -= aInference.cardProbabilities[CardType.CAPTAIN] * 3
        aScore -= aInference.cardProbabilities[CardType.AMBASSADOR] * 3
      }

      if (bInference) {
        bScore -= bInference.cardProbabilities[CardType.CAPTAIN] * 3
        bScore -= bInference.cardProbabilities[CardType.AMBASSADOR] * 3
      }

      return bScore - aScore
    })

    return {
      type: 'STEAL',
      playerId: this.player.id,
      targetPlayerId: rankedTargets[0].id,
      requiredCharacter: CardType.CAPTAIN,
      coinCost: 0,
      canBeBlocked: true,
      canBeChallenged: true,
      blockableBy: [CardType.AMBASSADOR, CardType.CAPTAIN]
    }
  }

  /**
   * Helper to build an untargeted action
   */
  private buildAction(actionType: UntargetedActionType): Action {
    switch (actionType) {
      case 'INCOME':
        return {
          type: 'INCOME',
          playerId: this.player.id,
          coinCost: 0,
          canBeBlocked: false,
          canBeChallenged: false,
          blockableBy: []
        }
      case 'FOREIGN_AID':
        return {
          type: 'FOREIGN_AID',
          playerId: this.player.id,
          coinCost: 0,
          canBeBlocked: true,
          canBeChallenged: false,
          blockableBy: [CardType.DUKE]
        }
      case 'TAX':
        return {
          type: 'TAX',
          playerId: this.player.id,
          requiredCharacter: CardType.DUKE,
          coinCost: 0,
          canBeBlocked: false,
          canBeChallenged: true,
          blockableBy: []
        }
      case 'EXCHANGE':
        return {
          type: 'EXCHANGE',
          playerId: this.player.id,
          requiredCharacter: CardType.AMBASSADOR,
          coinCost: 0,
          canBeBlocked: false,
          canBeChallenged: true,
          blockableBy: []
        }
      default:
        throw new Error(`Unsupported action type: ${actionType}`)
    }
  }
}
