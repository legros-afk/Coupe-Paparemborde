import { useEffect, useState } from 'react'
import { collection, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase'
import { COLLECTION_USERS } from '../constants'

// Le tri par points se fait côté client via computeStandings —
// les points ne sont plus stockés sur les documents users.
export function useUsers() {
  const [users, setUsers] = useState([])

  useEffect(() => {
    const q = collection(db, COLLECTION_USERS)
    const unsub = onSnapshot(q, (snap) => {
      setUsers(snap.docs.map(d => ({ uid: d.id, ...d.data() })))
    })
    return unsub
  }, [])

  return users
}
