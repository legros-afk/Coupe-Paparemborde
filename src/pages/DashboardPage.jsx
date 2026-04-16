import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCurrentUser } from '../hooks/useCurrentUser'
import { useUsers } from '../hooks/useUsers'
import { useMatches } from '../hooks/useMatches'
import CarteMatch from '../components/CarteMatch'
import PhotoProfil from '../components/PhotoProfil'
import { drapeau, nom } from '../data/countries'
import LoadingSpinner from '../components/LoadingSpinner'

const MEDALS = ['🥇', '🥈', '🥉']

export default function DashboardPage() {
  const navigate    = useNavigate()
  const { user }    = useAuth()
  const profile     = useCurrentUser(user?.uid)
  const allUsers    = useUsers()
  const { matches: allMatches } = useMatches()

  const codeVersUser = Object.fromEntries(
    allUsers.filter(u => u.countryCode).map(u => [u.countryCode, u])
  )

  const duels = allMatches.filter(
    m => codeVersUser[m.homeTeamCode] || codeVersUser[m.awayTeamCode]
  )

  const upcoming = allMatches
    .filter(m => m.statut !== 'TERMINE')
    .slice(0, 5)

  const top5 = allUsers.slice(0, 5)

  if (!profile) return <LoadingSpinner />

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="bg-orange-rwc px-5 pt-12 pb-8">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl">🏆</span>
          <h1 className="text-xl font-bold text-white">Coupe Paparemborde</h1>
        </div>
        <p className="text-white/75 text-sm">Sweepstakes familial · Australie 🇦🇺</p>
      </div>

      <div className="px-4 -mt-4 flex flex-col gap-4">
        {/* User card */}
        <div className="bg-white rounded-2xl shadow-md p-4 flex items-center gap-4">
          <PhotoProfil url={profile.photoUrl} prenom={profile.prenom} size={56} />
          <div className="flex-1 min-w-0">
            <p className="font-bold text-warm-black">Bonjour, {profile.prenom} !</p>
            {profile.countryCode
              ? <p className="text-sm text-warm-gray mt-0.5">
                  {drapeau(profile.countryCode)} {nom(profile.countryCode)}
                </p>
              : <p className="text-sm text-warm-gray/70 mt-0.5">Pays non encore attribué</p>
            }
          </div>
          <div className="flex flex-col items-center flex-shrink-0">
            <span className="text-3xl font-bold text-orange-rwc">{profile.points}</span>
            <span className="text-xs text-warm-gray">pts</span>
          </div>
        </div>

        {/* Quick actions */}
        <div className="flex gap-3">
          <button onClick={() => navigate('/matchs')}
            className="flex-1 bg-orange-rwc/10 text-orange-rwc font-semibold py-3 rounded-xl text-sm active:scale-95 transition-transform">
            🏉 Matchs
          </button>
          <button onClick={() => navigate('/chat/general')}
            className="flex-1 bg-teal-rwc/10 text-teal-rwc font-semibold py-3 rounded-xl text-sm active:scale-95 transition-transform">
            💬 Chat
          </button>
        </div>

        {/* Duels */}
        {duels.length > 0 && (
          <section>
            <h2 className="text-base font-bold text-warm-black mb-3">⚔️ Duels familiaux</h2>
            <div className="flex flex-col gap-3">
              {duels.slice(0, 3).map(m => (
                <CarteMatch key={m.id} match={m}
                  homeUser={codeVersUser[m.homeTeamCode]}
                  awayUser={codeVersUser[m.awayTeamCode]}
                  onClick={() => navigate(`/chat/${m.id}`)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Upcoming */}
        {upcoming.length > 0 && (
          <section>
            <h2 className="text-base font-bold text-warm-black mb-3">📅 Prochains matchs</h2>
            <div className="flex flex-col gap-3">
              {upcoming.map(m => (
                <CarteMatch key={m.id} match={m}
                  homeUser={codeVersUser[m.homeTeamCode]}
                  awayUser={codeVersUser[m.awayTeamCode]}
                  onClick={codeVersUser[m.homeTeamCode] || codeVersUser[m.awayTeamCode]
                    ? () => navigate(`/chat/${m.id}`) : undefined}
                />
              ))}
            </div>
          </section>
        )}

        {/* Rankings */}
        {top5.length > 0 && (
          <section>
            <h2 className="text-base font-bold text-warm-black mb-3">🏆 Classement</h2>
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              {top5.map((u, i) => (
                <div key={u.uid}
                  className={`flex items-center gap-3 px-4 py-3 ${i < top5.length - 1 ? 'border-b border-gray-50' : ''}`}>
                  <span className="text-xl w-7 text-center flex-shrink-0">
                    {i < 3 ? MEDALS[i] : `${i + 1}`}
                  </span>
                  <PhotoProfil url={u.photoUrl} prenom={u.prenom} size={38} />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-warm-black truncate">{u.prenom} {u.nom}</p>
                    {u.countryCode && (
                      <p className="text-xs text-warm-gray">{drapeau(u.countryCode)} {nom(u.countryCode)}</p>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-orange-rwc">{u.points} <span className="text-xs font-normal text-warm-gray">pts</span></p>
                    <p className="text-xs text-warm-gray">{u.victoires}V · {u.matchsJoues}J</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
