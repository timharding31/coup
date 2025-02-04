import { useMemo } from 'react'
import { useGameSocket } from '~/hooks/socket'
import { ActionControls } from './ActionControls'
import { ResponseControls } from './ResponseControls'
import { LoseInfluenceControls } from './LoseInfluenceControls'
import { GameTimer } from './GameTimer'
import { Link } from '@remix-run/react'
import { CardType, Game, Player } from '~/types'

interface GameBoardProps {
  playerId: string
}

export const GameBoard: React.FC<GameBoardProps> = ({ playerId }) => {
  const { game, startGame, sendResponse, selectCard } = useGameSocket()

  const { canAct, canRespond, canChallengeBlock, availableResponses, mustLoseInfluence, challenge } = useMemo(() => {
    return getPlayerMenuState(game, playerId)
  }, [game, playerId])

  const currentPlayer = game?.players[game.currentPlayerIndex]
  const playerCards = game?.players.find(p => p.id === playerId)?.influence || []

  return (
    <div>
      {/* Game status and player info */}
      {game && (
        <>
          {/* <PlayerList players={game.players} /> */}

          {game.hostId === playerId && game.status === 'WAITING' && (
            <button onClick={() => startGame()}>Start Game</button>
          )}

          {canAct && (
            <ActionControls
              targets={game.players.filter((_, i) => i !== game.currentPlayerIndex)}
              coins={currentPlayer?.coins || 0}
            />
          )}

          {(canRespond || canChallengeBlock) && (
            <ResponseControls
              onResponse={sendResponse}
              action={game.currentTurn!.action}
              availableResponses={availableResponses}
              targetPlayer={game.players[game.currentPlayerIndex].username}
            />
          )}

          {mustLoseInfluence && (
            <LoseInfluenceControls
              onSelectCard={selectCard}
              availableCards={playerCards}
              // reason={game.currentTurn?.loseInfluenceReason || 'CHALLENGE_LOST'}
            />
          )}

          {challenge != null && (
            <div>
              <span>{challenge.reason}</span>
              <div className='mt-2 flex'>
                {playerCards
                  .filter(card => !card.isRevealed)
                  .map(card => (
                    <button key={card.id} onClick={() => selectCard(card.id)}>
                      {card.type}
                    </button>
                  ))}
              </div>
            </div>
          )}

          {/* <GameTimer getRemainingTime={getRemainingTime} /> */}
        </>
      )}
      <pre>{JSON.stringify({ isHost: game?.hostId === playerId, ...game }, null, 2)}</pre>
    </div>
  )
}

interface MenuState {
  canAct: boolean // Can take a main action (current player's turn)
  canRespond: boolean // Can respond to current action (challenge/block)
  canChallengeBlock: boolean // Can challenge a block
  mustLoseInfluence: boolean
  availableResponses: {
    canAccept: boolean
    canChallenge: boolean
    canBlock: boolean
    availableBlocks: CardType[] // Cards that can be used to block
  }
  challenge?: {
    by: Player
    reason: string
  }
}

function getPlayerMenuState(game: Game | null, playerId: string): MenuState {
  // Default state - no menus
  const menuState: MenuState = {
    canAct: false,
    canRespond: false,
    canChallengeBlock: false,
    mustLoseInfluence: false,
    availableResponses: {
      canAccept: false,
      canChallenge: false,
      canBlock: false,
      availableBlocks: []
    }
  }

  if (!game || game.status !== 'IN_PROGRESS') {
    return menuState
  }

  const currentPlayer = game.players[game.currentPlayerIndex]
  const isCurrentPlayer = currentPlayer?.id === playerId
  const turn = game.currentTurn

  // No turn in progress, current player can act
  if (!turn) {
    menuState.canAct = isCurrentPlayer
    return menuState
  }

  switch (turn.phase) {
    case 'CHALLENGE_BLOCK_WINDOW':
      if (turn.respondedPlayers?.includes(playerId)) {
        return menuState
      }
      menuState.canRespond = true
      menuState.availableResponses = {
        canAccept: true,
        canChallenge: turn.action.canBeChallenged,
        canBlock: turn.action.canBeBlocked,
        availableBlocks: turn.action.blockableBy || []
      }
      break

    case 'CHALLENGE_RESOLUTION':
      // Only the challenged player can respond
      const challenger = game.players.find(p => p.id === turn.challengeResult?.challengingPlayer)
      console.log('challenger', challenger?.id, 'player', playerId)
      if (turn.challengeResult?.successful == null && challenger && challenger.id !== playerId) {
        menuState.canRespond = true
        menuState.challenge = {
          by: challenger,
          reason: `${challenger.username} challenged your ${turn.action.type}`
        }
      } else if (turn.challengeResult?.successful === false && challenger?.id === playerId) {
        menuState.canRespond = true
        menuState.mustLoseInfluence = true
      }
      break

    case 'BLOCK_CHALLENGE_RESOLUTION':
      // Only the challenged player can respond
      const blockChallenger = game.players.find(p => p.id === turn.challengeResult?.challengingPlayer)
      const blocker = game.players.find(p => p.id === turn.blockingPlayer)
      if (blockChallenger && blocker?.id === playerId) {
        menuState.canRespond = true
        menuState.challenge = {
          by: blockChallenger,
          reason: `${blockChallenger.username} challenged your block of ${currentPlayer!.username}'s ${turn.action.type}`
        }
      }

    case 'BLOCK_CHALLENGE_WINDOW':
      // Only the original action player can challenge the block
      if (turn.action.playerId === playerId) {
        menuState.canRespond = true
        menuState.availableResponses = {
          canAccept: true, // Accept the block
          canChallenge: true, // Challenge the block
          canBlock: false,
          availableBlocks: []
        }
      }
      break

    case 'LOSE_INFLUENCE':
      menuState.mustLoseInfluence = true
      break
  }

  return menuState
}
