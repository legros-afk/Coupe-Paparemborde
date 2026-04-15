import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSwipeNav } from '../hooks/useSwipeNav'
import { useAuth } from '../context/AuthContext'
import { useCurrentUser } from '../hooks/useCurrentUser'
import { useChat } from '../hooks/useChat'
import { useMatches } from '../hooks/useMatches'
import { useUsers } from '../hooks/useUsers'
import PhotoProfil from '../components/PhotoProfil'
import LoadingSpinner from '../components/LoadingSpinner'
import NavBar from '../components/NavBar'
import { drapeau, nom } from '../data/countries'

function formatTime(ts) {
  return new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit' }).format(new Date(ts))
}

export default function ChatPage() {
  const { salonId }       = useParams()
  const navigate          = useNavigate()
  const { user }          = useAuth()
  const profile           = useCurrentUser(user?.uid)
  const { messages, loading, sendMessage } = useChat(salonId)
  const allMatches        = useMatches()
  const allUsers          = useUsers()

  useSwipeNav()
  const [texte, setTexte] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef         = useRef(null)

  const isGeneral = salonId === 'general'
  const match = !isGeneral ? allMatches.find(m => m.id === salonId) : null
  const codeVersUser = Object.fromEntries(
    allUsers.filter(u => u.countryCode).map(u => [u.countryCode, u])
  )

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSend(e) {
    e.preventDefault()
    if (!texte.trim() || !profile || sending) return
    setSending(true)
    try {
      await sendMessage(salonId, {
        userId:       profile.uid,
        userName:     `${profile.prenom} ${profile.nom}`,
        userPhotoUrl: profile.photoUrl ?? '',
        texte:        texte.trim(),
        timestamp:    Date.now(),
      })
      setTexte('')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex flex-col" style={{ height: 'calc(100dvh - 60px)' }}>
      {/* Header */}
      <div className="bg-orange-rwc px-4 pt-12 pb-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-white text-xl leading-none">←</button>
          <div className="flex-1 min-w-0">
            {isGeneral ? (
              <>
                <h1 className="text-base font-bold text-white">💬 Chat familial</h1>
                <p className="text-white/75 text-xs">Coupe Paparemborde</p>
              </>
            ) : match ? (
              <>
                <h1 className="text-base font-bold text-white">
                  {drapeau(match.homeTeamCode)} vs {drapeau(match.awayTeamCode)}
                </h1>
                <p className="text-white/75 text-xs">
                  ⚔️ {codeVersUser[match.homeTeamCode]?.prenom ?? nom(match.homeTeamCode)} vs {codeVersUser[match.awayTeamCode]?.prenom ?? nom(match.awayTeamCode)}
                </p>
              </>
            ) : (
              <h1 className="text-base font-bold text-white">Chat</h1>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3 bg-creme-light">
        {loading
          ? <LoadingSpinner />
          : messages.length === 0
            ? <p className="text-center text-warm-gray py-8">💬 Soyez le premier à écrire !</p>
            : messages.map(msg => {
                const isMe = msg.userId === user?.uid
                return (
                  <div key={msg.id}
                    className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                    {!isMe && (
                      <PhotoProfil url={msg.userPhotoUrl} prenom={msg.userName} size={32} />
                    )}
                    <div className={`max-w-[75%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                      {!isMe && (
                        <p className="text-xs font-semibold text-orange-rwc mb-1 px-1">
                          {msg.userName}
                        </p>
                      )}
                      <div className={`px-4 py-2.5 rounded-2xl text-sm ${
                        isMe
                          ? 'bg-orange-rwc text-white rounded-br-sm'
                          : 'bg-white text-warm-black rounded-bl-sm shadow-sm'
                      }`}>
                        {msg.texte}
                      </div>
                      <p className="text-[10px] text-warm-gray mt-1 px-1">
                        {formatTime(msg.timestamp)}
                      </p>
                    </div>
                  </div>
                )
              })
        }
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend}
        className="bg-white border-t border-gray-100 px-4 py-3 flex items-end gap-3 flex-shrink-0"
        style={{ paddingBottom: '12px' }}>
        <textarea
          value={texte} onChange={e => setTexte(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(e) } }}
          placeholder="Votre message…"
          rows={1}
          className="flex-1 border border-gray-200 rounded-2xl px-4 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-rwc/50 focus:border-orange-rwc max-h-24"
          style={{ lineHeight: '1.4' }}
        />
        <button type="submit" disabled={!texte.trim() || sending}
          className="w-10 h-10 flex-shrink-0 bg-orange-rwc rounded-full flex items-center justify-center disabled:opacity-40 active:scale-95 transition-transform">
          <span className="text-white text-base">{sending ? '…' : '➤'}</span>
        </button>
      </form>
      <NavBar />
    </div>
  )
}
