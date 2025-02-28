import {
  Action,
  ActionType,
  CardType,
  Game,
  Player,
  TargetedActionType,
  TurnPhase,
  UntargetedActionType
} from '~/types'

interface ICoupRobot {
  decideAction(): Promise<Action>
  decideResponse(
    phase: TurnPhase,
    action: Action
  ): Promise<{
    response: 'accept' | 'challenge' | 'block'
    blockCard?: CardType
  }>
  decideCardSelection(phase: TurnPhase): Promise<string>
  decideExchangeCards(cardIds: string[]): Promise<string[]>
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

  private player: Player
  private game: Game

  constructor(player: Player, game: Game) {
    this.player = player
    this.game = game
  }

  static fromPlayer(player: Player, game: Game): CoupRobot {
    return new CoupRobot(player, game)
  }

  static getRandomUsername(existingBots: string[] = []): string {
    let n = 0
    while (n < 10) {
      const username = '🤖' + CoupRobot.USERNAMES[Math.floor(Math.random() * CoupRobot.USERNAMES.length)]
      if (!existingBots.includes(username)) return username
      n++
    }
    throw new Error('Failed to generate bot username')
  }

  /**
   * Decide what action to take on the robot's turn
   */
  async decideAction(): Promise<Action> {
    // If player has 10+ coins, must coup
    if (this.player.coins >= 10) {
      return this.decideCoupTarget()
    }

    // Choose a random action weighted by simple strategy
    const availableActions = this.getAvailableActions()
    const randomIndex = Math.floor(Math.random() * availableActions.length)
    const chosenAction = availableActions[randomIndex]

    // If it's a targeted action, choose a target
    if (['COUP', 'ASSASSINATE', 'STEAL'].includes(chosenAction)) {
      if (chosenAction === 'COUP') {
        return this.decideCoupTarget()
      } else if (chosenAction === 'ASSASSINATE') {
        return this.decideAssassinateTarget()
      } else if (chosenAction === 'STEAL') {
        return this.decideStealTarget()
      }
    }

    // For untargeted actions, simply build the action
    return this.buildAction(chosenAction as UntargetedActionType)
  }

  /**
   * Decide how to respond to another player's action
   */
  async decideResponse(
    phase: TurnPhase,
    action: Action
  ): Promise<{ response: 'accept' | 'challenge' | 'block'; blockCard?: CardType }> {
    // Most of the time, just accept the action
    if (Math.random() < 0.7) {
      return { response: 'accept' }
    }

    if (phase === 'AWAITING_OPPONENT_RESPONSES') {
      // If this is a blockable action and it targets the bot, try to block
      if (action.canBeBlocked) {
        if (action.targetPlayerId === this.player.id || action.type === 'FOREIGN_AID') {
          // Choose a random card to block with
          const blockableBy = action.blockableBy
          if (blockableBy.length > 0) {
            const randomCardIndex = Math.floor(Math.random() * blockableBy.length)
            return {
              response: 'block',
              blockCard: blockableBy[randomCardIndex]
            }
          }
        }
      }

      // If action can be challenged, occasionally challenge it
      if (action.canBeChallenged && Math.random() < 0.3) {
        return { response: 'challenge' }
      }
    } else if (phase === 'AWAITING_ACTIVE_RESPONSE_TO_BLOCK') {
      // If our action was blocked, occasionally challenge the block
      if (action.playerId === this.player.id && Math.random() < 0.3) {
        return { response: 'challenge' }
      }
    }

    // Default: accept
    return { response: 'accept' }
  }

  /**
   * Choose which card to select when the bot needs to lose influence or reveal a card
   */
  async decideCardSelection(phase: TurnPhase): Promise<string> {
    const unrevealedCards = this.player.influence.filter(card => !card.isRevealed)

    if (unrevealedCards.length === 0) {
      throw new Error('No cards available to select')
    }

    // If this is a challenge defense phase and we have the claimed card, use it
    if (
      (phase === 'AWAITING_ACTOR_DEFENSE' || phase === 'AWAITING_BLOCKER_DEFENSE') &&
      this.game.currentTurn?.challengeResult?.challengedCaracter
    ) {
      const challengedCardType = this.game.currentTurn.challengeResult.challengedCaracter
      const defenseCard = unrevealedCards.find(card => card.type === challengedCardType)

      if (defenseCard) {
        return defenseCard.id
      }
    }

    // Otherwise, choose a random card to lose
    const randomIndex = Math.floor(Math.random() * unrevealedCards.length)
    return unrevealedCards[randomIndex].id
  }

  /**
   * Choose which cards to keep after an exchange
   */
  async decideExchangeCards(cardIds: string[]): Promise<string[]> {
    // Need to return 2 cards to keep
    if (cardIds.length <= 2) {
      return cardIds
    }

    // Shuffle the cards and pick the first 2
    const shuffled = [...cardIds]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }

    return shuffled.slice(0, 2)
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

    // Add character-based actions (tax, steal, exchange)
    availableActions.push('TAX')
    availableActions.push('EXCHANGE')

    // Check if there are valid steal targets
    const stealTargets = this.game.players.filter(
      p => p.id !== this.player.id && p.coins > 0 && p.influence.some(card => !card.isRevealed)
    )
    if (stealTargets.length > 0) {
      availableActions.push('STEAL')
    }

    // Check if assassinate is affordable
    if (this.player.coins >= 3) {
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

    // Sort by threat level (unrevealed cards, then coins)
    validTargets.sort((a, b) => {
      const aCards = a.influence.filter(c => !c.isRevealed).length
      const bCards = b.influence.filter(c => !c.isRevealed).length

      if (aCards !== bCards) {
        return bCards - aCards // More cards = higher threat
      }

      return b.coins - a.coins // More coins = higher threat
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
    // Similar logic to coup, but we might have different priorities
    const validTargets = this.game.players.filter(
      p => p.id !== this.player.id && p.influence.some(card => !card.isRevealed)
    )

    if (validTargets.length === 0) {
      throw new Error('No valid targets for assassination')
    }

    // Randomly choose a target
    const randomIndex = Math.floor(Math.random() * validTargets.length)

    return {
      type: 'ASSASSINATE',
      playerId: this.player.id,
      targetPlayerId: validTargets[randomIndex].id,
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
    // Prioritize players with the most coins
    const validTargets = this.game.players.filter(
      p => p.id !== this.player.id && p.coins > 0 && p.influence.some(card => !card.isRevealed)
    )

    if (validTargets.length === 0) {
      throw new Error('No valid targets for stealing')
    }

    // Sort by coins
    validTargets.sort((a, b) => b.coins - a.coins)

    return {
      type: 'STEAL',
      playerId: this.player.id,
      targetPlayerId: validTargets[0].id,
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
