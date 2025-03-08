import React, { useRef } from 'react'
import { useCoupContext } from '~/context/CoupContext'
import { GameTable } from './GameTable'
import { GameLobby } from './GameLobby'
import { GameOver } from './GameOver'
import { GameControls } from './GameControls'
import { Header } from './Header'
import { PlayerHand } from './PlayerHand'
import { CourtDeck } from './CourtDeck'
import { LayoutGroup } from 'framer-motion'
import { Card } from '~/types'

interface GameBoardProps {
  playerId: string
}

export const GameBoard: React.FC<GameBoardProps> = ({ playerId }) => {
  const { game, players, sendResponse, selectCard, exchangeCards, addBot, isLoading } = useCoupContext()

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
        <GameTable game={game} players={players}>
          {(() => {
            switch (game.status) {
              case 'WAITING':
                return <GameLobby playerId={playerId} game={game} addBot={addBot} />

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
                    <div className='flex-none pb-4 flex items-center justify-center'>
                      <CourtDeck deck={game.deck} />
                    </div>
                  </>
                )

              case 'COMPLETED':
                return <GameOver playerId={playerId} game={game} />
            }
          })()}
        </GameTable>
      </div>

      <PlayerHand game={game} {...players.myself} />
    </div>
  )
}
