import { Game } from '~/types'

export function getGameUrl(game: Game<'server' | 'client'>) {
  const getUrlStatus = () => ({ WAITING: 'waiting', IN_PROGRESS: 'in-progress', COMPLETED: 'completed' })[game.status]
  return `/games/${game.id}/${getUrlStatus()}`
}
