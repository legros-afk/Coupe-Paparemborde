import { useEffect, useState } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase'
import { COLLECTION_USERS } from '../constants'

export function useCurrentUser(uid) {
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    if (!uid) { setProfile(null); return }
    const unsub = onSnapshot(doc(db, COLLECTION_USERS, uid), (snap) => {
      setProfile(snap.exists() ? { uid: snap.id, ...snap.data() } : null)
    })
    return unsub
  }, [uid])

  return profile
}
