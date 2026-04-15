import { useState } from 'react'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
import { Link, useNavigate } from 'react-router-dom'
import { auth, db } from '../firebase'
import { COLLECTION_USERS } from '../constants'
import { signInWithGoogle } from '../utils/googleAuth'

function translateError(code) {
  switch (code) {
    case 'auth/email-already-in-use': return 'Cette adresse e-mail est déjà utilisée.'
    case 'auth/invalid-email':        return 'Adresse e-mail invalide.'
    case 'auth/weak-password':        return 'Mot de passe trop court (minimum 6 caractères).'
    case 'auth/popup-closed-by-user': return null
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

  const [loadingGoogle, setLoadingGoogle] = useState(false)
  const canSubmit = prenom && nom && email && mdp.length >= 6 && !loading

  async function handleGoogle() {
    setError(null)
    setLoadingGoogle(true)
    try {
      await signInWithGoogle()
      navigate('/dashboard')
    } catch (err) {
      const msg = translateError(err.code)
      if (msg) setError(msg)
    } finally {
      setLoadingGoogle(false)
    }
  }

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

          {/* Google button */}
          <button onClick={handleGoogle} type="button" disabled={loadingGoogle || loading}
            className="w-full flex items-center justify-center gap-3 border border-gray-200 rounded-xl py-3 text-sm font-semibold text-warm-black hover:bg-gray-50 active:scale-95 transition-transform disabled:opacity-50 mb-4">
            {loadingGoogle
              ? <span className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
              : <GoogleIcon />
            }
            Continuer avec Google
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs text-warm-gray">ou créer avec e-mail</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

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

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18">
      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
      <path fill="#FBBC05" d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"/>
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z"/>
    </svg>
  )
}
