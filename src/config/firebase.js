import { getApp, getApps, initializeApp } from 'firebase/app'
import { getAnalytics, isSupported } from 'firebase/analytics'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

function cleanEnv(value) {
  return typeof value === 'string' ? value.trim() : ''
}

export const firebaseConfig = {
  apiKey: cleanEnv(import.meta.env.VITE_FIREBASE_API_KEY),
  authDomain: cleanEnv(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN),
  projectId: cleanEnv(import.meta.env.VITE_FIREBASE_PROJECT_ID),
  storageBucket: cleanEnv(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET),
  messagingSenderId: cleanEnv(import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID),
  appId: cleanEnv(import.meta.env.VITE_FIREBASE_APP_ID),
  measurementId: cleanEnv(import.meta.env.VITE_FIREBASE_MEASUREMENT_ID),
}

const requiredCoreKeys = ['apiKey', 'authDomain', 'projectId', 'appId']
export const hasFirebaseConfig = requiredCoreKeys.every((key) => Boolean(firebaseConfig[key]))
export const hasFirebaseStorageConfig = hasFirebaseConfig && Boolean(firebaseConfig.storageBucket)

export const firebaseApp = hasFirebaseConfig
  ? getApps().length > 0
    ? getApp()
    : initializeApp(firebaseConfig)
  : null

export const firebaseAuth = firebaseApp ? getAuth(firebaseApp) : null
export const firebaseDb = firebaseApp ? getFirestore(firebaseApp) : null
export const firebaseStorage = firebaseApp && hasFirebaseStorageConfig ? getStorage(firebaseApp) : null

export let firebaseAnalytics = null
if (firebaseApp && firebaseConfig.measurementId) {
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
