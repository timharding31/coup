import { createCookieSessionStorage, redirect } from '@remix-run/node'
import jwt from 'jsonwebtoken'

// Define interfaces for JWT payload and verify result
interface JWTPayload {
  playerId: string
  iat?: number
  exp?: number
}

export class SessionService {
  private jwtSecret = process.env.JWT_SECRET || process.env.SESSION_SECRET || 'default-secret'
  private jwtExpiration = 60 * 60 * 24 * 30 // 30 days

  private sessionStorage = createCookieSessionStorage({
    cookie: {
      name: 'coup_session',
      secure: process.env.NODE_ENV === 'production',
      secrets: [process.env.SESSION_SECRET || 'default-secret'],
      sameSite: 'lax',
      path: '/',
      maxAge: this.jwtExpiration,
      httpOnly: true
    }
  })

  async createUserSession(playerId: string) {
    // Generate JWT token
    const token = this.signJWT({ playerId })

    // Store in session
    const session = await this.sessionStorage.getSession()
    session.set('playerId', playerId)
    session.set('token', token)

    return this.sessionStorage.commitSession(session)
  }

  async getPlayerSession(request: Request) {
    const session = await this.sessionStorage.getSession(request.headers.get('Cookie'))
    const playerId = session.get('playerId') as string | null
    const token = session.get('token') as string | null

    // Verify JWT token if it exists
    let isValidToken = false
    if (playerId && token) {
      isValidToken = this.verifyJWT(token, playerId)
    }

    return {
      session,
      playerId,
      isValidToken,
      token
    }
  }

  async destroySession(request: Request) {
    const { session } = await this.getPlayerSession(request)
    return this.sessionStorage.destroySession(session)
  }

  async requirePlayerSession(request: Request) {
    const { playerId, isValidToken } = await this.getPlayerSession(request)

    // Require both playerId and valid token
    if (!playerId || !isValidToken) {
      throw redirect('/login')
    }

    return { playerId }
  }

  // Generate service token for Firebase Cloud Functions
  generateServiceToken(serviceId: string = 'firebase-functions') {
    return jwt.sign(
      {
        type: 'service',
        serviceId
      },
      this.jwtSecret,
      { expiresIn: this.jwtExpiration }
    )
  }

  // Verify a service token
  verifyServiceToken(token: string): boolean {
    try {
      const payload = jwt.verify(token, this.jwtSecret) as { type: string; serviceId: string }
      return payload.type === 'service'
    } catch (error) {
      return false
    }
  }

  // Authentication middleware for API routes
  async requireAuth(request: Request) {
    // First check for session cookie (user auth)
    const { playerId, isValidToken } = await this.getPlayerSession(request)
    if (playerId && isValidToken) {
      return { playerId, type: 'user' as const }
    }

    // Then check for Authorization header (service auth)
    const authHeader = request.headers.get('Authorization')
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      if (this.verifyServiceToken(token)) {
        const payload = jwt.decode(token) as { serviceId: string }
        return { serviceId: payload.serviceId, type: 'service' as const }
      }
    }

    // No valid authentication found
    throw new Response('Unauthorized', { status: 401 })
  }

  private signJWT(payload: JWTPayload): string {
    return jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.jwtExpiration
    })
  }

  private verifyJWT(token: string, expectedPlayerId: string): boolean {
    try {
      const payload = jwt.verify(token, this.jwtSecret) as JWTPayload
      return payload.playerId === expectedPlayerId
    } catch (error) {
      return false
    }
  }
}
