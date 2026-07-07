import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMatches } from '../hooks/useMatches'
import { useUsers } from '../hooks/useUsers'
import CarteMatch from '../components/CarteMatch'
import LoadingSpinner from '../components/LoadingSpinner'
import { PHASES } from '../constants'
import { buildCodeToUser } from '../utils/standings'

const PHASE_FILTERS = [
  { key: null, label: 'Tous' },
  ...Object.entries(PHASES).map(([key, v]) => ({ key, label: `${v.emoji} ${v.label}` })),
]

const STATUT_FILTERS = [
  { key: null,        label: 'Tous'      },
  { key: 'EN_COURS',  label: '🔴 En direct' },
  { key: 'PLANIFIE',  label: 'À venir'   },
  { key: 'TERMINE',   label: 'Terminés'  },
]

function Chip({ active, label, onClick }) {
  return (
    <button onClick={onClick}
      className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
        active
          ? 'bg-orange-rwc text-white'
          : 'bg-white border border-gray-200 text-warm-gray'
      }`}>
      {label}
    </button>
  )
}

export default function MatchesPage() {
  const navigate     = useNavigate()
  const { matches: allMatches } = useMatches()
  const allUsers     = useUsers()
  const [filtrePhase,  setFiltrePhase]  = useState(null)
  const [filtreStatut, setFiltreStatut] = useState(null)

  const codeVersUser = buildCodeToUser(allUsers)

  const filtered = allMatches
    .filter(m => !filtrePhase  || m.phase  === filtrePhase)
    .filter(m => !filtreStatut || m.statut === filtreStatut)

  // Group by phase
  const groupes = {}
  filtered.forEach(m => {
    if (!groupes[m.phase]) groupes[m.phase] = []
    groupes[m.phase].push(m)
  })

  const phaseOrder = Object.keys(PHASES)
  const groupesTries = phaseOrder
    .filter(p => groupes[p])
    .map(p => ({ phase: p, matches: groupes[p] }))

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="bg-orange-rwc px-5 pt-12 pb-5">
        <h1 className="text-xl font-bold text-white">Calendrier</h1>
        <p className="text-white/75 text-sm">RWC 2027 · Australie 🏉</p>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 flex flex-col gap-2">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {PHASE_FILTERS.map(f => (
            <Chip key={String(f.key)} label={f.label}
              active={filtrePhase === f.key}
              onClick={() => setFiltrePhase(f.key)} />
          ))}
        </div>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {STATUT_FILTERS.map(f => (
            <Chip key={String(f.key)} label={f.label}
              active={filtreStatut === f.key}
              onClick={() => setFiltreStatut(f.key)} />
          ))}
        </div>
      </div>

      {/* Matches */}
      <div className="px-4 py-4 flex flex-col gap-6">
        {allMatches.length === 0
          ? <LoadingSpinner />
          : groupesTries.length === 0
            ? <p className="text-center text-warm-gray py-8">Aucun match pour ces filtres.</p>
            : groupesTries.map(({ phase, matches }) => {
                const meta = PHASES[phase] ?? PHASES.PHASE_DE_POULES
                return (
                  <section key={phase}>
                    <h2 className="text-sm font-bold text-warm-black mb-3">
                      {meta.emoji} {meta.label}
                      <span className="ml-2 text-warm-gray font-normal">({matches.length})</span>
                    </h2>
                    <div className="flex flex-col gap-3">
                      {matches.map(m => {
                        const isDuel = codeVersUser[m.homeTeamCode] || codeVersUser[m.awayTeamCode]
                        return (
                          <CarteMatch key={m.id} match={m}
                            homeUser={codeVersUser[m.homeTeamCode]}
                            awayUser={codeVersUser[m.awayTeamCode]}
                            onClick={isDuel ? () => navigate(`/chat/${m.id}`) : undefined}
                          />
                        )
                      })}
                    </div>
                  </section>
                )
              })
        }
      </div>
    </div>
  )
}
