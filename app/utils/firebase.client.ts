import { initializeApp } from 'firebase/app'
import { getDatabase } from 'firebase/database'

declare global {
  interface Window {
    ENV: {
      FIREBASE_DATABASE_URL: string
    }
  }
}

const firebaseConfig = {
  databaseURL: window.ENV.FIREBASE_DATABASE_URL
}

let db: ReturnType<typeof getDatabase>

function getFirebaseDatabase() {
  if (!db) {
    const app = initializeApp(firebaseConfig)
    db = getDatabase(app)
  }
  return db
}

export { getFirebaseDatabase }
