import React from 'react'
import type { Action, CardType } from '~/types'
import { BlockControls } from './BlockControls'
import { ChallengeControls } from './ChallengeControls'

interface ResponseControlsProps {
  onResponse: (type: 'accept' | 'challenge' | 'block', blockingCard?: CardType) => void
  action: Action
  availableResponses: {
    canAccept: boolean
    canChallenge: boolean
    canBlock: boolean
    availableBlocks: CardType[]
  }
  targetPlayer: string
}

export const ResponseControls: React.FC<ResponseControlsProps> = ({
  onResponse,
  action,
  availableResponses,
  targetPlayer
}) => {
  const [showBlockOptions, setShowBlockOptions] = React.useState(false)

  if (showBlockOptions) {
    return (
      <BlockControls
        onResponse={response => {
          setShowBlockOptions(false)
          onResponse(response)
        }}
        action={action}
        availableBlocks={availableResponses.availableBlocks}
      />
    )
  }

  if (availableResponses.canChallenge) {
    return <ChallengeControls onResponse={onResponse} action={action} targetPlayer={targetPlayer} />
  }

  return (
    <div className='response-controls'>
      {availableResponses.canAccept && <button onClick={() => onResponse('accept')}>Accept Action</button>}

      {availableResponses.canBlock && <button onClick={() => setShowBlockOptions(true)}>Block Action</button>}
    </div>
  )
}
