import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { firebaseDb, hasFirebaseConfig } from '../config/firebase'
import { createId, readJson, writeJson } from '../utils/storage'

const localContactsKey = 'novatech-contacts'

export async function createContactMessage(payload) {
  const message = {
    id: createId('contact'),
    name: payload.name?.trim() || '',
    email: payload.email?.trim() || '',
    message: payload.message?.trim() || '',
    createdAt: Date.now(),
    status: 'new',
  }

  if (hasFirebaseConfig && firebaseDb) {
    const reference = await addDoc(collection(firebaseDb, 'contacts'), {
      ...message,
      createdAt: serverTimestamp(),
    })

    return { ...message, id: reference.id }
  }

  const currentMessages = readJson(localContactsKey, [])
  writeJson(localContactsKey, [message, ...currentMessages])
  return message
}