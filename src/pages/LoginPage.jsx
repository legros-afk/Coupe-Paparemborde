import { useState } from 'react'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { Link, useNavigate } from 'react-router-dom'
import { auth } from '../firebase'

function translateError(code) {
  switch (code) {
    case 'auth/invalid-email':           return 'Adresse e-mail invalide.'
    case 'auth/user-not-found':          return 'Aucun compte avec cet e-mail.'
    case 'auth/wrong-password':
    case 'auth/invalid-credential':      return 'Mot de passe incorrect.'
    case 'auth/too-many-requests':       return 'Trop de tentatives. Réessayez plus tard.'
    case 'auth/network-request-failed':  return 'Erreur réseau. Vérifiez votre connexion.'
    default:                             return 'Erreur de connexion. Réessayez.'
  }
}

export default function LoginPage() {
  const navigate          = useNavigate()
  const [email, setEmail] = useState('')
  const [mdp,   setMdp]   = useState('')
  const [showMdp, setShowMdp] = useState(false)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await signInWithEmailAndPassword(auth, email, mdp)
      navigate('/dashboard')
    } catch (err) {
      setError(translateError(err.code))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-creme-light">
      {/* Orange header */}
      <div className="bg-orange-rwc flex flex-col items-center justify-center pt-16 pb-12 px-6">
        <div className="w-24 h-24 mb-4 bg-white rounded-3xl shadow-lg flex items-center justify-center p-1">
          <img src="/icon-192.png" alt="logo" className="w-full h-full object-contain" />
        </div>
        <h1 className="text-2xl font-bold text-white">Coupe Paparemborde</h1>
        <p className="text-white/80 text-sm mt-1">Sweepstakes familial · Australie 🇦🇺</p>
      </div>

      {/* Floating card */}
      <div className="flex-1 flex flex-col px-4 -mt-6">
        <div className="bg-white rounded-3xl shadow-xl p-6 max-w-sm w-full mx-auto">
          <h2 className="text-xl font-bold text-warm-black mb-6">Connexion</h2>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-warm-gray mb-1">E-mail</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-rwc/50 focus:border-orange-rwc"
                placeholder="votre@email.com" required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-warm-gray mb-1">Mot de passe</label>
              <div className="relative">
                <input
                  type={showMdp ? 'text' : 'password'} value={mdp} onChange={e => setMdp(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm pr-12 focus:outline-none focus:ring-2 focus:ring-orange-rwc/50 focus:border-orange-rwc"
                  placeholder="••••••••" required
                />
                <button type="button" onClick={() => setShowMdp(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-warm-gray text-lg">
                  {showMdp ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button
              type="submit" disabled={loading || !email || !mdp}
              className="mt-2 w-full bg-orange-rwc text-white font-semibold py-3 rounded-xl disabled:opacity-50 transition-opacity active:scale-95"
            >
              {loading ? '…' : 'Se connecter'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-warm-gray">
            Pas encore de compte ?{' '}
            <Link to="/register" className="text-orange-rwc font-semibold">
              Créer un compte
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
