import { useEffect, useState, useCallback } from 'react'
import { ref, onValue, push, set } from 'firebase/database'
import { rtdb } from '../firebase'
import { DB_CHATS } from '../constants'

function cheminSalon(salonId) {
  return salonId === 'general'
    ? `${DB_CHATS}/general`
    : `${DB_CHATS}/match_${salonId}`
}

export function useChat(salonId) {
  const [messages, setMessages] = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    if (!salonId) return
    setLoading(true)
    const dbRef = ref(rtdb, cheminSalon(salonId))
    const unsub = onValue(dbRef, (snapshot) => {
      const msgs = []
      snapshot.forEach((child) => {
        msgs.push({ id: child.key, ...child.val() })
      })
      msgs.sort((a, b) => a.timestamp - b.timestamp)
      setMessages(msgs)
      setLoading(false)
    })
    return () => unsub()
  }, [salonId])

  const sendMessage = useCallback(async (salonId, message) => {
    const dbRef  = ref(rtdb, cheminSalon(salonId))
    const newRef = push(dbRef)
    await set(newRef, { ...message, id: newRef.key })
  }, [])

  return { messages, loading, sendMessage }
}
