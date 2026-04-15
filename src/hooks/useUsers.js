import { useEffect, useState } from 'react'
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore'
import { db } from '../firebase'
import { COLLECTION_USERS } from '../constants'

export function useUsers() {
  const [users, setUsers] = useState([])

  useEffect(() => {
    const q = query(collection(db, COLLECTION_USERS), orderBy('points', 'desc'))
    const unsub = onSnapshot(q, (snap) => {
      setUsers(snap.docs.map(d => ({ uid: d.id, ...d.data() })))
    })
    return unsub
  }, [])

  return users
}
