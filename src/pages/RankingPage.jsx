import { useUsers } from '../hooks/useUsers'
import { useMatches } from '../hooks/useMatches'
import PhotoProfil from '../components/PhotoProfil'
import LoadingSpinner from '../components/LoadingSpinner'
import Flag from '../components/Flag'
import { computeStandings, userCountries } from '../utils/standings'

const MEDALS = ['🥇', '🥈', '🥉']

export default function RankingPage() {
  const allUsers    = useUsers()
  const { matches } = useMatches()

  if (allUsers.length === 0) return <LoadingSpinner label="Chargement…" />

  const standings = computeStandings(allUsers, matches)

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="bg-orange-rwc px-5 pt-12 pb-5">
        <h1 className="text-xl font-bold text-white">🏆 Classement</h1>
        <p className="text-white/75 text-sm">{standings.length} participant(s)</p>
      </div>

      <div className="px-4 py-4">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {standings.map((u, i) => (
            <div key={u.uid}
              className={`flex items-center gap-3 px-4 py-3 ${i < standings.length - 1 ? 'border-b border-gray-50' : ''}`}>
              <span className="text-xl w-7 text-center flex-shrink-0">
                {i < 3 ? MEDALS[i] : `${i + 1}`}
              </span>
              <PhotoProfil url={u.photoUrl} prenom={u.prenom} size={38} />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-warm-black truncate">{u.prenom} {u.nom}</p>
                {userCountries(u).length > 0 && (
                  <p className="text-xs text-warm-gray flex items-center gap-1 flex-wrap">
                    {userCountries(u).map(c => <Flag key={c} code={c} width={16} />)}
                  </p>
                )}
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-bold text-orange-rwc">{u.points} <span className="text-xs font-normal text-warm-gray">pts</span></p>
                <p className="text-xs text-warm-gray">{u.victoires}V · {u.matchsJoues}J</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
