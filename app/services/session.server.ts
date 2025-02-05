import { createCookieSessionStorage, redirect } from '@remix-run/node'

export class SessionService {
  private sessionStorage = createCookieSessionStorage({
    cookie: {
      name: 'coup_session',
      secure: process.env.NODE_ENV === 'production',
      secrets: [process.env.SESSION_SECRET || 'default-secret'],
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      httpOnly: true
    }
  })

  async createUserSession(playerId: string) {
    const session = await this.sessionStorage.getSession()
    session.set('playerId', playerId)
    return this.sessionStorage.commitSession(session)
  }

  async getPlayerSession(request: Request) {
    const session = await this.sessionStorage.getSession(request.headers.get('Cookie'))
    return { session, playerId: session.get('playerId') as string | null }
  }

  async destroySession(request: Request) {
    const { session } = await this.getPlayerSession(request)
    return this.sessionStorage.destroySession(session)
  }

  async requirePlayerSession(request: Request) {
    const { playerId } = await this.getPlayerSession(request)
    if (!playerId) {
      throw redirect('/login')
    }
    return { playerId }
  }
}
