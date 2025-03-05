import React, { useEffect, useRef } from 'react'
import { useCoupContext } from '~/context/CoupContext'
import { GameTable } from './GameTable'
import { GameLobby } from './GameLobby'
import { GameOver } from './GameOver'
import { GameControls } from './GameControls'
import { Header } from './Header'
import { PlayerHand } from './PlayerHand'
import { CourtDeck } from './CourtDeck'
import { useDeckCoordinatesAtom } from '~/hooks/useDeckCoordinates'
import _ from 'lodash'

interface GameBoardProps {
  playerId: string
}

export const GameBoard: React.FC<GameBoardProps> = ({ playerId }) => {
  const { game, players, startGame, leaveGame, sendResponse, selectCard, exchangeCards, addBot, isLoading } =
    useCoupContext()

  const [deckCoordinates, setDeckCoordinates] = useDeckCoordinatesAtom()

  const courtDeckRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = courtDeckRef.current
    if (game.status !== 'IN_PROGRESS' || !el) return
    const debouncedOnResize = _.debounce(() => {
      if (el) {
        const rect = el.getBoundingClientRect()
        const x = rect.left + rect.width / 2
        const y = rect.top + rect.height / 2
        setDeckCoordinates([x, y])
      }
    }, 500)
    debouncedOnResize()
    window.addEventListener('resize', debouncedOnResize)
    return () => {
      debouncedOnResize.cancel()
      window.removeEventListener('resize', debouncedOnResize)
    }
  }, [game.status])

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
                    <div className='flex-none py-2 flex items-center justify-center' ref={courtDeckRef}>
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
