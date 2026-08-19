import { getApp, getApps, initializeApp } from 'firebase/app'
import { getAnalytics, isSupported } from 'firebase/analytics'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

function readEnv(...keys) {
  for (const key of keys) {
    const value = import.meta.env[key]
    if (typeof value === 'string' && value.trim()) {
      return value.trim()
    }
  }

  return ''
}

export const firebaseConfig = {
  apiKey: readEnv('VITE_FIREBASE_API_KEY', 'VITE_API_KEY'),
  authDomain: readEnv('VITE_FIREBASE_AUTH_DOMAIN', 'VITE_AUTH_DOMAIN'),
  projectId: readEnv('VITE_FIREBASE_PROJECT_ID', 'VITE_PROJECT_ID'),
  storageBucket: readEnv('VITE_FIREBASE_STORAGE_BUCKET', 'VITE_STORAGE_BUCKET'),
  messagingSenderId: readEnv('VITE_FIREBASE_MESSAGING_SENDER_ID', 'VITE_MESSAGING_SENDER_ID', 'VITE_FIREBASE_MESSAGINGSENDERID'),
  appId: readEnv('VITE_FIREBASE_APP_ID', 'VITE_APP_ID'),
  measurementId: readEnv('VITE_FIREBASE_MEASUREMENT_ID', 'VITE_MEASUREMENT_ID'),
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
