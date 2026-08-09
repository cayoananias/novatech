import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth'
import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore'
import { firebaseAuth, firebaseDb, hasFirebaseConfig } from '../config/firebase'

function buildUserProfile(firebaseUser, profileData = {}) {
  return {
    uid: firebaseUser.uid,
    name: profileData.name || firebaseUser.displayName || '',
    email: firebaseUser.email || profileData.email || '',
    phone: profileData.phone || '',
    role: profileData.role || 'user',
    createdAt: profileData.createdAt || null,
    updatedAt: profileData.updatedAt || null,
  }
}

async function syncUserProfile(firebaseUser, fallbackProfile = {}) {
  if (!firebaseDb) {
    return buildUserProfile(firebaseUser, fallbackProfile)
  }

  const profileReference = doc(firebaseDb, 'users', firebaseUser.uid)
  const profileSnapshot = await getDoc(profileReference)

  if (profileSnapshot.exists()) {
    return { uid: firebaseUser.uid, ...profileSnapshot.data() }
  }

  const profile = buildUserProfile(firebaseUser, fallbackProfile)
  await setDoc(profileReference, {
    ...profile,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

  return profile
}

export async function registerUser({ name, email, password }) {
  if (!hasFirebaseConfig || !firebaseAuth || !firebaseDb) {
    throw new Error('Configure as variáveis VITE_FIREBASE_* para ativar cadastro e login.')
  }

  const credential = await createUserWithEmailAndPassword(firebaseAuth, email, password)

  if (name) {
    await updateProfile(credential.user, { displayName: name })
  }

  const profile = buildUserProfile(credential.user, { name, email, role: 'user' })
  await setDoc(doc(firebaseDb, 'users', credential.user.uid), {
    ...profile,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

  return { firebaseUser: credential.user, profile }
}

export async function loginUser({ email, password }) {
  if (!hasFirebaseConfig || !firebaseAuth) {
    throw new Error('Configure as variáveis VITE_FIREBASE_* para ativar cadastro e login.')
  }

  const credential = await signInWithEmailAndPassword(firebaseAuth, email, password)
  const profile = await syncUserProfile(credential.user)
  return { firebaseUser: credential.user, profile }
}

export async function logoutUser() {
  if (!firebaseAuth) {
    return
  }

  await signOut(firebaseAuth)
}

export async function resetPassword(email) {
  if (!hasFirebaseConfig || !firebaseAuth) {
    throw new Error('Configure as variáveis VITE_FIREBASE_* para ativar recuperação de senha.')
  }

  return sendPasswordResetEmail(firebaseAuth, email)
}

export function observeAuth(onChange) {
  if (!firebaseAuth) {
    onChange({ firebaseUser: null, profile: null, ready: true, configured: false })
    return () => undefined
  }

  return onAuthStateChanged(firebaseAuth, async (firebaseUser) => {
    if (!firebaseUser) {
      onChange({ firebaseUser: null, profile: null, ready: true, configured: true })
      return
    }

    const profile = await syncUserProfile(firebaseUser)
    onChange({ firebaseUser, profile, ready: true, configured: true })
  })
}

export async function updateUserProfile(uid, payload) {
  if (!firebaseDb) {
    throw new Error('Firebase não configurado.')
  }

  await updateDoc(doc(firebaseDb, 'users', uid), {
    ...payload,
    updatedAt: serverTimestamp(),
  })
}