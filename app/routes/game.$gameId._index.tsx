import React from 'react'
import { LoaderFunction, redirect } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { GameBoard } from '~/components/GameBoard'
import { AppContext } from '~/types'

export const loader: LoaderFunction = async ({ request, context, params }) => {
  const { sessionService, gameService } = context as AppContext

  const { playerId } = await sessionService.requirePlayerSession(request)
  const gameId = params.gameId!
  const { game } = await gameService.getGame(gameId)

  if (!playerId || !game) {
    throw redirect('/')
  }

  switch (game.status) {
    case 'COMPLETED':
      throw redirect('completed')
    case 'IN_PROGRESS':
      throw redirect('in-progress')
    case 'WAITING':
      throw redirect('waiting')
  }
}

export default function GameIndex() {
  return null
}
