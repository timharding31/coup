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
import classNames from 'classnames'

interface GameBoardProps {
  playerId: string
}

export const GameBoard: React.FC<GameBoardProps> = ({ playerId }) => {
  const { game, players, sendResponse, selectCard, exchangeCards, startGame, addBot, removeBot, isLoading } =
    useCoupContext()

  // Keep track of previous game state to detect newly dealt cards
  const prevGameRef = useRef<{
    deckLength: number
    playerCards: Map<string, Set<string>>
  }>({
    deckLength: 0,
    playerCards: new Map()
  })

  return (
    <div
      className={classNames('transition-all grid grid-cols-1 w-full h-full min-h-0 overflow-hidden', {
        'grid-rows-[auto_minmax(416px,1fr)_minmax(0,auto)]': game.status === 'WAITING',
        'grid-rows-[auto_1fr_auto]': game.status === 'IN_PROGRESS',
        'grid-rows-[auto_minmax(384px,1fr)_minmax(0,auto)]': game.status === 'COMPLETED'
      })}
      // style={game.status === 'COMPLETED' ? { gridTemplateRows: 'auto 414px' } : {}}
    >
      <Header />
      <GameTable game={game} players={players}>
        {(() => {
          switch (game.status) {
            case 'WAITING':
              return (
                <GameLobby
                  playerId={playerId}
                  game={game}
                  startGame={startGame}
                  addBot={addBot}
                  removeBot={removeBot}
                  isLoading={isLoading}
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

      <PlayerHand game={game} {...players.myself} />
    </div>
  )
}
