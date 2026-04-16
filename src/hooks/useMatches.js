import { useEffect, useState } from 'react'
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore'
import { db } from '../firebase'
import { COLLECTION_MATCHES } from '../constants'

export function useMatches() {
  const [matches, setMatches] = useState([])
  const [error, setError]     = useState(null)

  useEffect(() => {
    const q = query(collection(db, COLLECTION_MATCHES), orderBy('dateTimestamp'))
    const unsub = onSnapshot(
      q,
      (snap) => { setError(null); setMatches(snap.docs.map(d => ({ id: d.id, ...d.data() }))) },
      (err)  => { console.error('useMatches:', err); setError(err.message) }
    )
    return unsub
  }, [])

  return { matches, error }
}
