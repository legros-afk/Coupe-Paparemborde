import { useEffect, useState, useCallback } from 'react'
import { collection, onSnapshot, orderBy, query, limitToLast, addDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { COLLECTION_CHATS } from '../constants'

// Chat sur Firestore (l'ancien Realtime Database est verrouillé) : les règles
// exigent un profil famille, ce que le RTDB ne permettait pas de vérifier.
function cheminSalon(salonId) {
  return salonId === 'general' ? 'general' : `match_${salonId}`
}

function messagesRef(salonId) {
  return collection(db, COLLECTION_CHATS, cheminSalon(salonId), 'messages')
}

export function useChat(salonId) {
  const [messages, setMessages] = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    if (!salonId) return
    setLoading(true)
    const q = query(messagesRef(salonId), orderBy('timestamp'), limitToLast(100))
    const unsub = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
    return unsub
  }, [salonId])

  const sendMessage = useCallback(async (salonId, message) => {
    await addDoc(messagesRef(salonId), message)
  }, [])

  return { messages, loading, sendMessage }
}
