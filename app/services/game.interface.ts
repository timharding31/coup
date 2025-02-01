import { Action, CardType, Game, TurnState } from '~/types'

export interface IGameService {
  createGame(hostId: string): Promise<{
    gameId: string
    pin: string
  }>

  joinGameByPin(
    playerId: string,
    pin: string
  ): Promise<{
    gameId: string
  }>

  leaveGame(
    playerId: string,
    gameId: string
  ): Promise<{
    success: boolean
  }>

  startGame(
    gameId: string,
    hostId: string
  ): Promise<{
    game: Game | null
  }>

  getGame(gameId: string): Promise<{
    game: Game | null
  }>

  getCurrentTurn(gameId: string): Promise<{
    turn: TurnState | null
  }>

  startGameTurn(
    gameId: string,
    action: Partial<Action>
  ): Promise<{
    success: boolean
    turnState: TurnState | null
  }>

  handlePlayerResponse(
    gameId: string,
    playerId: string,
    response: 'accept' | 'challenge' | 'block',
    blockingCard?: CardType
  ): Promise<{ success: boolean; newTurnState: TurnState | null }>

  handleCardSelection(gameId: String, playerId: string, cardType: CardType): Promise<{ success: boolean }>
}
