import * as admin from 'firebase-admin';

let initialized = false;
let db: admin.database.Database;

export function getDatabase(): admin.database.Database {
  if (!initialized) {
    try {
      db = admin.database();
    } catch (e) {
      // Initialize Firebase Admin if it hasn't been done yet
      admin.initializeApp();
      db = admin.database();
    }
    initialized = true;
  }
  return db;
}