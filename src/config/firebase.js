import { getApp, getApps, initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import { getAnalytics, isSupported } from 'firebase/analytics'

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || '',
}

const requiredKeys = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId']
export const hasFirebaseConfig = requiredKeys.every((key) => Boolean(firebaseConfig[key]))

export const firebaseApp = hasFirebaseConfig
  ? getApps().length > 0
    ? getApp()
    : initializeApp(firebaseConfig)
  : null

export const firebaseAuth = firebaseApp ? getAuth(firebaseApp) : null
export const firebaseDb = firebaseApp ? getFirestore(firebaseApp) : null
export const firebaseStorage = firebaseApp ? getStorage(firebaseApp) : null

export let firebaseAnalytics = null
if (firebaseApp) {
  isSupported()
    .then((supported) => {
      if (supported) {
        firebaseAnalytics = getAnalytics(firebaseApp)
      }
    })
    .catch((err) => {
      console.warn('Firebase Analytics check failed:', err)
    })
}