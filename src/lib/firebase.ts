import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { doc, getDoc, getFirestore, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// settings helpers
export interface UserSettings {
  distinction: number;
  disableAnimation: boolean;
  autoNextRound: boolean;
  randomizePresentation: boolean;
}

export async function loadUserSettings(uid: string): Promise<UserSettings | null> {
  try {
    const ref = doc(db, "settings", uid);
    const snap = await getDoc(ref);
    return snap.exists() ? (snap.data() as UserSettings) : null;
  } catch (err) {
    console.error("Error loading settings:", err);
    return null;
  }
}

export async function saveUserSettings(uid: string, settings: UserSettings) {
  try {
    const ref = doc(db, "settings", uid);
    await setDoc(ref, settings, { merge: true });
  } catch (err) {
    console.error("Error saving settings:", err);
  }
}
