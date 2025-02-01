import React from 'react'
import type { ActionType } from '~/types'

interface ActionControlsProps {
  onAction: (action: ActionType) => void
  coins: number
}

export const ActionControls: React.FC<ActionControlsProps> = ({ onAction, coins }) => {
  // Must coup if player has 10 or more coins
  if (coins >= 10) {
    return <button onClick={() => onAction('COUP')}>Coup (Required)</button>
  }

  return (
    <div>
      <button onClick={() => onAction('INCOME')}>Income (+1 coin)</button>
      <button onClick={() => onAction('FOREIGN_AID')}>Foreign Aid (+2 coins)</button>
      {coins >= 7 && <button onClick={() => onAction('COUP')}>Coup (-7 coins)</button>}
      {coins >= 3 && <button onClick={() => onAction('ASSASSINATE')}>Assassinate (-3 coins)</button>}
      <button onClick={() => onAction('TAX')}>Tax (+3 coins)</button>
      <button onClick={() => onAction('STEAL')}>Steal (Take 2 coins)</button>
    </div>
  )
}
