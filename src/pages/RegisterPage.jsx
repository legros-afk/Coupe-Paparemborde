import { useState } from 'react'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
import { Link, useNavigate } from 'react-router-dom'
import { auth, db } from '../firebase'
import { COLLECTION_USERS } from '../constants'

function translateError(code) {
  switch (code) {
    case 'auth/email-already-in-use': return 'Cette adresse e-mail est déjà utilisée.'
    case 'auth/invalid-email':        return 'Adresse e-mail invalide.'
    case 'auth/weak-password':        return 'Mot de passe trop court (minimum 6 caractères).'
    default:                          return 'Erreur lors de la création du compte.'
  }
}

export default function RegisterPage() {
  const navigate = useNavigate()
  const [prenom, setPrenom] = useState('')
  const [nom,    setNom]    = useState('')
  const [email,  setEmail]  = useState('')
  const [mdp,    setMdp]    = useState('')
  const [showMdp, setShowMdp] = useState(false)
  const [error,   setError]   = useState(null)
  const [loading, setLoading] = useState(false)

  const canSubmit = prenom && nom && email && mdp.length >= 6 && !loading

  async function handleSubmit(e) {
    e.preventDefault()
    if (!canSubmit) return
    setError(null)
    setLoading(true)
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, mdp)
      await setDoc(doc(db, COLLECTION_USERS, cred.user.uid), {
        uid: cred.user.uid, prenom, nom, email,
        photoUrl: '', photoDriveId: '', countryCode: '',
        isAdmin: false, points: 0, victoires: 0, matchsJoues: 0,
        createdAt: Date.now(),
      })
      navigate('/dashboard')
    } catch (err) {
      setError(translateError(err.code))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-creme-light flex flex-col">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-100 px-4 py-4 flex items-center gap-3">
        <Link to="/login" className="text-2xl leading-none">←</Link>
        <h1 className="text-lg font-bold text-warm-black">Créer un compte</h1>
      </div>

      <div className="flex-1 px-4 py-6">
        <div className="bg-white rounded-3xl shadow-sm p-6 max-w-sm w-full mx-auto">
          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-sm font-medium text-warm-gray mb-1">Prénom</label>
                <input type="text" value={prenom} onChange={e => setPrenom(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-rwc/50 focus:border-orange-rwc"
                  placeholder="Jean" required />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-warm-gray mb-1">Nom</label>
                <input type="text" value={nom} onChange={e => setNom(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-rwc/50 focus:border-orange-rwc"
                  placeholder="Dupont" required />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-warm-gray mb-1">Adresse e-mail</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-rwc/50 focus:border-orange-rwc"
                placeholder="votre@email.com" required />
            </div>

            <div>
              <label className="block text-sm font-medium text-warm-gray mb-1">
                Mot de passe <span className="text-xs text-warm-gray/70">(6 caractères min.)</span>
              </label>
              <div className="relative">
                <input type={showMdp ? 'text' : 'password'} value={mdp} onChange={e => setMdp(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm pr-12 focus:outline-none focus:ring-2 focus:ring-orange-rwc/50 focus:border-orange-rwc"
                  placeholder="••••••••" required minLength={6} />
                <button type="button" onClick={() => setShowMdp(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-warm-gray text-lg">
                  {showMdp ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button type="submit" disabled={!canSubmit}
              className="mt-2 w-full bg-orange-rwc text-white font-semibold py-3 rounded-xl disabled:opacity-50 transition-opacity active:scale-95">
              {loading ? '…' : 'Créer mon compte'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
