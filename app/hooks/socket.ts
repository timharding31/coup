import { useContext } from 'react'
import { GameSocketContext } from '~/context/GameSocket'

export function useGameSocket() {
  const gameSocket = useContext(GameSocketContext)
  if (!gameSocket) {
    throw new Error('useGameSocket must be used within a GameSocketProvider')
  }
  return gameSocket
}

export function useGame() {
  return useGameSocket().game
}
