import { useState } from 'react'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { Link, useNavigate } from 'react-router-dom'
import { auth } from '../firebase'
import { signInWithGoogleLogin } from '../utils/googleAuth'

function translateError(code) {
  switch (code) {
    case 'auth/invalid-email':           return 'Adresse e-mail invalide.'
    case 'auth/user-not-found':          return 'Aucun compte avec cet e-mail.'
    case 'auth/wrong-password':
    case 'auth/invalid-credential':      return 'Mot de passe incorrect.'
    case 'auth/too-many-requests':       return 'Trop de tentatives. Réessayez plus tard.'
    case 'auth/network-request-failed':  return 'Erreur réseau. Vérifiez votre connexion.'
    case 'auth/popup-blocked':           return 'Popup bloquée par le navigateur. Autorisez les popups et réessayez.'
    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-popup-request': return null
    case 'app/no-profile':               return 'Ce compte Google n’est pas encore membre. Utilisez « Créer un compte » avec le code famille.'
    default:                             return 'Erreur de connexion. Réessayez.'
  }
}

export default function LoginPage() {
  const navigate          = useNavigate()
  const [email, setEmail] = useState('')
  const [mdp,   setMdp]   = useState('')
  const [showMdp, setShowMdp] = useState(false)
  const [error,   setError]   = useState(null)
  const [loading, setLoading] = useState(false)
  const [loadingGoogle, setLoadingGoogle] = useState(false)

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

  async function handleGoogle() {
    setError(null)
    setLoadingGoogle(true)
    try {
      await signInWithGoogleLogin(auth)
      navigate('/dashboard')
    } catch (err) {
      const msg = translateError(err.code)
      if (msg) setError(msg)
    } finally {
      setLoadingGoogle(false)
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

          {/* Google button */}
          <button onClick={handleGoogle} disabled={loadingGoogle || loading}
            className="w-full flex items-center justify-center gap-3 border border-gray-200 rounded-xl py-3 text-sm font-semibold text-warm-black hover:bg-gray-50 active:scale-95 transition-transform disabled:opacity-50 mb-4">
            {loadingGoogle
              ? <span className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
              : <GoogleIcon />
            }
            Continuer avec Google
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs text-warm-gray">ou</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

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

            <button type="submit" disabled={loading || !email || !mdp}
              className="mt-2 w-full bg-orange-rwc text-white font-semibold py-3 rounded-xl disabled:opacity-50 transition-opacity active:scale-95">
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
