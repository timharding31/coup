import React from 'react'
import type { Action } from '~/types'

interface ChallengeControlsProps {
  onResponse: (response: 'accept' | 'challenge' | 'block') => void
  action: Action
  targetPlayer: string
}

export const ChallengeControls: React.FC<ChallengeControlsProps> = ({ onResponse, action, targetPlayer }) => {
  return (
    <div className='challenge-controls'>
      <h3>Challenge {action.type}?</h3>
      <div className='challenge-description'>{getChallengeDescription(action, targetPlayer)}</div>
      <div className='challenge-buttons'>
        <button onClick={() => onResponse('challenge')} className='challenge-button'>
          Challenge! (They must reveal {getRequiredCard(action.type)})
        </button>
        <button onClick={() => onResponse('accept')} className='accept-button'>
          Allow Action
        </button>
      </div>
    </div>
  )
}

function getChallengeDescription(action: Action, targetPlayer: string): string {
  switch (action.type) {
    case 'TAX':
      return `${targetPlayer} claims to have a Duke to take 3 coins`
    case 'ASSASSINATE':
      return `${targetPlayer} claims to have an Assassin`
    case 'STEAL':
      return `${targetPlayer} claims to have a Captain`
    case 'EXCHANGE':
      return `${targetPlayer} claims to have an Ambassador`
    default:
      return `${targetPlayer} is attempting ${action.type}`
  }
}

function getRequiredCard(actionType: string): string {
  switch (actionType) {
    case 'TAX':
      return 'Duke'
    case 'ASSASSINATE':
      return 'Assassin'
    case 'STEAL':
      return 'Captain'
    case 'EXCHANGE':
      return 'Ambassador'
    default:
      return ''
  }
}
