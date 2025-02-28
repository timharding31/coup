import React from 'react'
import { useCoupContext } from '~/context/CoupContext'
import { GameTable } from './GameTable'
import { GameLobby } from './GameLobby'
import { GameOver } from './GameOver'
import { GameControls } from './GameControls'
import { Header } from './Header'
import { PlayerHand } from './PlayerHand'
import { CourtDeck } from './CourtDeck'

interface GameBoardProps {
  playerId: string
}

export const GameBoard: React.FC<GameBoardProps> = ({ playerId }) => {
  const { game, players, startGame, leaveGame, sendResponse, selectCard, exchangeCards, isLoading } = useCoupContext()

  return (
    <>
      <Header />
      <GameTable playerId={playerId} game={game} players={players}>
        <CourtDeck deckCount={game.deck.length} />

        {(() => {
          switch (game.status) {
            case 'WAITING':
              return <GameLobby game={game} playerId={playerId} startGame={startGame} leaveGame={leaveGame} />

            case 'IN_PROGRESS':
              return (
                <GameControls
                  game={game}
                  players={players}
                  sendResponse={sendResponse}
                  selectCard={selectCard}
                  exchangeCards={exchangeCards}
                  isLoading={isLoading}
                />
              )

            case 'COMPLETED':
              return <GameOver game={game} leaveGame={leaveGame} />
          }
        })()}
      </GameTable>
      <PlayerHand game={game} {...players.myself} />
    </>
  )
}
