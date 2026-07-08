import StatutBadge from './StatutBadge'
import Flag from './Flag'
import DuelIcon from './DuelIcon'
import { nom } from '../data/countries'
import { PHASES } from '../constants'

function formatDate(ts) {
  if (!ts) return ''
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
  }).format(new Date(ts))
}

export default function CarteMatch({ match, homeUser, awayUser, onClick }) {
  const isDuel    = homeUser != null || awayUser != null
  const phase     = PHASES[match.phase] ?? PHASES.PHASE_DE_POULES
  const clickable = !!onClick && isDuel

  return (
    <div
      onClick={clickable ? onClick : undefined}
      className={[
        'bg-white rounded-2xl p-4 shadow-sm border',
        isDuel   ? 'border-orange-rwc shadow-orange-rwc/20 shadow-md' : 'border-gray-100',
        clickable ? 'cursor-pointer active:scale-[0.98] transition-transform' : '',
      ].join(' ')}
    >
      {/* Phase + statut */}
      <div className="flex items-center justify-between mb-3">
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${phase.color}`}>
          {phase.emoji} {phase.label}
          {match.groupe ? ` · Gr. ${match.groupe}` : ''}
        </span>
        <StatutBadge statut={match.statut} />
      </div>

      {/* Teams + score */}
      <div className="flex items-center justify-between gap-2">
        {/* Home */}
        <div className="flex flex-col items-center flex-1 gap-1">
          <Flag code={match.homeTeamCode} width={40} />
          <span className="text-xs font-medium text-center text-warm-black leading-tight">
            {homeUser ? homeUser.prenom : nom(match.homeTeamCode)}
          </span>
        </div>

        {/* Score or datetime */}
        <div className="flex flex-col items-center flex-shrink-0">
          {match.statut === 'TERMINE' || match.statut === 'EN_COURS'
            ? (
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-warm-black">
                  {match.homeScore ?? '–'}
                </span>
                <span className="text-lg text-warm-gray">–</span>
                <span className="text-2xl font-bold text-warm-black">
                  {match.awayScore ?? '–'}
                </span>
              </div>
            )
            : (
              <span className="text-xs text-warm-gray text-center font-medium">
                {formatDate(match.dateTimestamp)}
              </span>
            )
          }
        </div>

        {/* Away */}
        <div className="flex flex-col items-center flex-1 gap-1">
          <Flag code={match.awayTeamCode} width={40} />
          <span className="text-xs font-medium text-center text-warm-black leading-tight">
            {awayUser ? awayUser.prenom : nom(match.awayTeamCode)}
          </span>
        </div>
      </div>

      {/* Duel badge */}
      {isDuel && (
        <div className="mt-3 text-center">
          <span className="text-xs font-semibold text-orange-rwc"><DuelIcon size={14} /> Duel familial !</span>
        </div>
      )}

      {/* Location */}
      {match.stade && (
        <p className="mt-2 text-xs text-warm-gray text-center">
          📍 {match.stade}{match.ville ? `, ${match.ville}` : ''}
        </p>
      )}
    </div>
  )
}
