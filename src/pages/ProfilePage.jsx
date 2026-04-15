import { useState } from 'react'
import { signOut } from 'firebase/auth'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCurrentUser } from '../hooks/useCurrentUser'
import PhotoProfil from '../components/PhotoProfil'
import { drapeau, nom, PAR_CODE } from '../data/countries'
import { PHASES } from '../constants'
import { auth } from '../firebase'

export default function ProfilePage() {
  const navigate    = useNavigate()
  const { user }    = useAuth()
  const profile     = useCurrentUser(user?.uid)
  const [confirm, setConfirm] = useState(false)

  async function handleLogout() {
    await signOut(auth)
    navigate('/login')
  }

  if (!profile) return null

  const pays = profile.countryCode ? PAR_CODE[profile.countryCode] : null

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="bg-orange-rwc px-5 pt-12 pb-5 flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">Mon profil</h1>
        <button onClick={() => setConfirm(true)}
          className="bg-white/20 text-white px-3 py-1.5 rounded-full text-sm font-medium">
          Déconnexion
        </button>
      </div>

      <div className="px-4 py-4 flex flex-col gap-4">
        {/* Identity */}
        <div className="bg-orange-rwc/10 rounded-2xl p-5 flex flex-col items-center gap-3">
          <PhotoProfil url={profile.photoUrl} prenom={profile.prenom} size={88} />
          <div className="text-center">
            <p className="text-xl font-bold text-warm-black">{profile.prenom} {profile.nom}</p>
            <p className="text-sm text-warm-gray mt-0.5">{profile.email}</p>
            <p className="text-[10px] text-warm-gray/60 mt-1 font-mono break-all">{profile.uid}</p>
          </div>
        </div>

        {/* Country */}
        {pays ? (
          <div className="bg-white rounded-2xl p-5 flex flex-col items-center gap-2 shadow-sm">
            <p className="text-xs font-semibold text-warm-gray uppercase tracking-wider">Mon pays</p>
            <span className="text-5xl">{pays.drapeau}</span>
            <p className="text-lg font-bold text-warm-black">{pays.nom}</p>
            <span className="px-3 py-1 rounded-full bg-orange-rwc/10 text-orange-rwc text-xs font-semibold">
              {pays.confederation}
            </span>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-5 flex flex-col items-center gap-2 shadow-sm text-center">
            <span className="text-4xl">🏉</span>
            <p className="font-semibold text-warm-black">Pays non encore attribué</p>
            <p className="text-sm text-warm-gray">L'administrateur vous attribuera un pays bientôt.</p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { emoji: '🏆', label: 'Points',   value: profile.points,      bg: 'bg-orange-rwc/10', color: 'text-orange-rwc' },
            { emoji: '✅', label: 'Victoires', value: profile.victoires,   bg: 'bg-teal-rwc/10',   color: 'text-teal-rwc'   },
            { emoji: '🏉', label: 'Matchs',    value: profile.matchsJoues, bg: 'bg-lime-rwc/20',   color: 'text-warm-black' },
          ].map(({ emoji, label, value, bg, color }) => (
            <div key={label} className={`${bg} rounded-2xl p-3 flex flex-col items-center gap-1`}>
              <span className="text-xl">{emoji}</span>
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
              <p className="text-xs text-warm-gray">{label}</p>
            </div>
          ))}
        </div>

        {/* Points system */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <p className="text-sm font-bold text-warm-black mb-3">Système de points</p>
          <div className="flex flex-col gap-2">
            {Object.entries(PHASES).map(([key, meta]) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-sm text-warm-gray">{meta.emoji} {meta.label}</span>
                <span className={`text-sm font-semibold px-2 py-0.5 rounded-full ${meta.color}`}>
                  {meta.points} pts
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Confirm dialog */}
      {confirm && (
        <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold text-warm-black mb-2">Se déconnecter ?</h3>
            <p className="text-sm text-warm-gray mb-6">Vous devrez vous reconnecter pour accéder à l'application.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirm(false)}
                className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-semibold text-warm-gray">
                Annuler
              </button>
              <button onClick={handleLogout}
                className="flex-1 py-3 bg-red-500 rounded-xl text-sm font-semibold text-white">
                Déconnecter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
