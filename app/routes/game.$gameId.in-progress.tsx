import { useOutletContext } from '@remix-run/react'
import { GameBoard } from '~/components/GameBoard'

export default function GameFlow() {
  const { playerId } = useOutletContext<{ playerId: string }>()
  return <GameBoard playerId={playerId} />
}
