import { useEffect, useState } from 'react'
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore'
import { db } from '../firebase'
import { COLLECTION_MATCHES } from '../constants'

export function useMatches() {
  const [matches, setMatches] = useState([])

  useEffect(() => {
    const q = query(collection(db, COLLECTION_MATCHES), orderBy('dateTimestamp'))
    const unsub = onSnapshot(q, (snap) => {
      setMatches(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
    return unsub
  }, [])

  return matches
}
