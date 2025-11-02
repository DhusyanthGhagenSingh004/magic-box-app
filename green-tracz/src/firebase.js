// src/firebase.js
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Basic defensive check
if (!firebaseConfig.apiKey || firebaseConfig.apiKey === 'your_api_key_here') {
  // eslint-disable-next-line no-console
  console.warn(
    "Firebase not configured — set VITE_FIREBASE_* env vars in .env to enable Firestore persistence"
  );
  console.warn("The app will work with local storage only");
}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/**
 * saveSnapshotToFirestore(snapshot)
 * - snapshot: plain object (distanceMeters, durationSec, avgSpeed, mode, kgCO2, cost, points, startedAt, stoppedAt, userId?)
 * Returns: Promise<docRef>
 */
export async function saveSnapshotToFirestore(snapshot) {
  // Check if Firebase is properly configured
  if (!firebaseConfig.apiKey || firebaseConfig.apiKey === 'your_api_key_here') {
    throw new Error('Firebase not configured - check environment variables');
  }

  try {
    const doc = {
      ...snapshot,
      // Firestore server timestamp for createdAt
      createdAt: serverTimestamp(),
    };

    // store under collection "snapshots"
    const col = collection(db, "snapshots");
    const docRef = await addDoc(col, doc);
    console.log('Snapshot saved to Firestore:', docRef.id);
    return docRef;
  } catch (error) {
    console.error('Firestore save error:', error);
    throw error;
  }
}

export { db };
