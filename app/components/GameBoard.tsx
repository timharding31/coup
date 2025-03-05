import React, { useEffect, useRef, useCallback } from 'react'
import { useCoupContext } from '~/context/CoupContext'
import { GameTable } from './GameTable'
import { GameLobby } from './GameLobby'
import { GameOver } from './GameOver'
import { GameControls } from './GameControls'
import { Header } from './Header'
import { PlayerHand } from './PlayerHand'
import { CourtDeck } from './CourtDeck'
import _ from 'lodash'
import { Card } from '~/types'

interface GameBoardProps {
  playerId: string
}

export const GameBoard: React.FC<GameBoardProps> = ({ playerId }) => {
  const { game, players, startGame, leaveGame, sendResponse, selectCard, exchangeCards, addBot, isLoading } =
    useCoupContext()

  // const recordDealtCard = useRecordDealtCardAtom()

  // Keep track of previous game state to detect newly dealt cards
  const prevGameRef = useRef<{
    deckLength: number
    playerCards: Map<string, Set<string>>
  }>({
    deckLength: 0,
    playerCards: new Map()
  })

  return (
    <div className='flex flex-col h-full min-h-0 overflow-hidden'>
      <Header className='flex-none' />
      <div className='flex-auto min-h-0 overflow-hidden'>
        <GameTable playerId={playerId} game={game} players={players}>
          {(() => {
            switch (game.status) {
              case 'WAITING':
                return (
                  <GameLobby
                    game={game}
                    playerId={playerId}
                    startGame={startGame}
                    leaveGame={leaveGame}
                    addBot={addBot}
                  />
                )

              case 'IN_PROGRESS':
                return (
                  <>
                    <GameControls
                      game={game}
                      players={players}
                      sendResponse={sendResponse}
                      selectCard={selectCard}
                      exchangeCards={exchangeCards}
                      isLoading={isLoading}
                    />
                    <div id='court-deck' className='flex-none py-2 flex items-center justify-center'>
                      <CourtDeck deckCount={game.deck.length} />
                    </div>
                  </>
                )

              case 'COMPLETED':
                return <GameOver game={game} leaveGame={leaveGame} />
            }
          })()}
        </GameTable>
      </div>

      <PlayerHand game={game} {...players.myself} />
    </div>
  )
}
