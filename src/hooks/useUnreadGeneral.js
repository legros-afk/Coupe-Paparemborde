import { useEffect, useState } from 'react'
import { collection, limitToLast, onSnapshot, orderBy, query } from 'firebase/firestore'
import { db } from '../firebase'
import { COLLECTION_CHATS } from '../constants'

// "Lu jusqu'à" stocké en localStorage : par appareil, ce qui suffit pour un
// badge — pas besoin d'écrire un reçu de lecture en base pour chaque membre.
const KEY = 'lastReadGeneral'
const EVT = 'chat-general-read'

export function markGeneralRead(timestamp) {
  localStorage.setItem(KEY, String(timestamp))
  window.dispatchEvent(new Event(EVT))
}

// true si le dernier message du chat général est plus récent que la dernière
// lecture sur cet appareil et ne vient pas de l'utilisateur lui-même.
export function useUnreadGeneral(uid) {
  const [latest, setLatest] = useState(null)
  const [readTs, setReadTs] = useState(() => Number(localStorage.getItem(KEY) ?? 0))

  useEffect(() => {
    const onRead = () => setReadTs(Number(localStorage.getItem(KEY) ?? 0))
    window.addEventListener(EVT, onRead)
    return () => window.removeEventListener(EVT, onRead)
  }, [])

  useEffect(() => {
    const q = query(
      collection(db, COLLECTION_CHATS, 'general', 'messages'),
      orderBy('timestamp'), limitToLast(1)
    )
    return onSnapshot(q, (snap) => {
      const d = snap.docs[0]
      setLatest(d ? { timestamp: d.data().timestamp, userId: d.data().userId } : null)
    })
  }, [])

  return !!latest && latest.userId !== uid && latest.timestamp > readTs
}
