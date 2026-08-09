import { collection, onSnapshot, orderBy, query } from 'firebase/firestore'
import { firebaseDb, hasFirebaseConfig } from '../config/firebase'

export function subscribeUsers(onChange) {
  if (!hasFirebaseConfig || !firebaseDb) {
    onChange([])
    return () => undefined
  }

  const usersQuery = query(collection(firebaseDb, 'users'), orderBy('createdAt', 'desc'))
  return onSnapshot(usersQuery, (snapshot) => {
    onChange(snapshot.docs.map((userDoc) => ({ id: userDoc.id, ...userDoc.data() })))
  })
}