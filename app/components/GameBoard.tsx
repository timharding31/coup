import { useMemo } from 'react'
import { useGameSocket } from '~/hooks/socket'
import { ActionControls } from './ActionControls'
import { ResponseControls } from './ResponseControls'
import { LoseInfluenceControls } from './LoseInfluenceControls'
import { GameTimer } from './GameTimer'
import { Link } from '@remix-run/react'
import { CardType, Game } from '~/types'

interface GameBoardProps {
  playerId: string
}

export const GameBoard: React.FC<GameBoardProps> = ({ playerId }) => {
  const { game, startGame, performAction, sendResponse, selectCard } = useGameSocket()

  const { canAct, canRespond, canChallengeBlock, availableResponses, mustLoseInfluence } = useMemo(() => {
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

          {canAct && <ActionControls onAction={performAction} coins={currentPlayer?.coins || 0} />}

          {canRespond && (
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
              availableCards={playerCards.map(c => c.type)}
              // reason={game.currentTurn?.loseInfluenceReason || 'CHALLENGE_LOST'}
            />
          )}

          <GameTimer timeoutAt={game.currentTurn?.timeoutAt} />
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

  const isCurrentPlayer = game.players[game.currentPlayerIndex].id === playerId
  const turn = game.currentTurn

  // No turn in progress, current player can act
  if (!turn) {
    menuState.canAct = isCurrentPlayer
    return menuState
  }

  // Already responded in this phase
  if (turn.respondedPlayers?.includes(playerId)) {
    return menuState
  }

  // Can't respond to your own action
  if (turn.action.playerId === playerId) {
    // Exception: can challenge a block against your action
    if (turn.phase === 'BLOCK_CHALLENGE_WINDOW') {
      menuState.canChallengeBlock = true
      menuState.availableResponses = {
        canAccept: true,
        canChallenge: true,
        canBlock: false,
        availableBlocks: []
      }
    }
    return menuState
  }

  switch (turn.phase) {
    case 'CHALLENGE_BLOCK_WINDOW':
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
      if (turn.challengingPlayer === playerId) {
        menuState.canRespond = true
        menuState.availableResponses = {
          canAccept: true, // Lose influence
          canChallenge: true, // Reveal card
          canBlock: false,
          availableBlocks: []
        }
      }
      break

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
