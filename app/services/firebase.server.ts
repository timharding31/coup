import { cert, getApps, initializeApp } from 'firebase-admin/app'
import { getDatabase } from 'firebase-admin/database'

const isDev = process.env.NODE_ENV === 'development'

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
    }),
    databaseURL: isDev ? process.env.FIREBASE_DEV_DATABASE_URL : process.env.FIREBASE_DATABASE_URL
  })
}

export const db = getDatabase()
