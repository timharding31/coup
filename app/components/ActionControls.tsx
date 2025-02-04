import React, { useState } from 'react'
import { useGameSocket } from '~/hooks/socket'
import type { ActionType, Player, TargetedActionType } from '~/types'

interface ActionControlsProps {
  targets: Player[]
  coins: number
}

export const ActionControls: React.FC<ActionControlsProps> = ({ targets, coins }) => {
  const { performTargetedAction, performUntargetedAction } = useGameSocket()
  const [targetedAction, setTargetedAction] = useState<TargetedActionType>()

  if (targetedAction) {
    return (
      <div>
        <span>
          {targetedAction}
          {targetedAction === 'STEAL' ? ' from' : ''} which player?
        </span>
        {targets.map(target => (
          <button key={`target-${target.id}`} onClick={() => performTargetedAction(targetedAction, target.id)}>
            {target.username} ({target.coins} coins)
          </button>
        ))}
      </div>
    )
  }

  // Must coup if player has 10 or more coins
  if (coins >= 10) {
    return <button onClick={() => setTargetedAction('COUP')}>Coup (Required)</button>
  }

  return (
    <div>
      <button onClick={() => performUntargetedAction('INCOME')}>Income (+1 coin)</button>
      <button onClick={() => performUntargetedAction('FOREIGN_AID')}>Foreign Aid (+2 coins)</button>
      {coins >= 7 && <button onClick={() => setTargetedAction('COUP')}>Coup (-7 coins)</button>}
      {coins >= 3 && <button onClick={() => setTargetedAction('ASSASSINATE')}>Assassinate (-3 coins)</button>}
      <button onClick={() => performUntargetedAction('TAX')}>Tax (+3 coins)</button>
      <button onClick={() => setTargetedAction('STEAL')}>Steal (Take 2 coins)</button>
    </div>
  )
}
