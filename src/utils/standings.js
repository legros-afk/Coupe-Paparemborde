import { PHASES } from '../constants'

// Pays d'un membre — accepte l'ancien champ countryCode (string)
// et le nouveau countryCodes (array) pour les documents pas encore migrés.
export function userCountries(u) {
  if (Array.isArray(u?.countryCodes)) return u.countryCodes
  return u?.countryCode ? [u.countryCode] : []
}

// Map code pays → membre propriétaire
export function buildCodeToUser(users) {
  const map = {}
  for (const u of users) {
    for (const c of userCountries(u)) map[c] = u
  }
  return map
}

// Classement dérivé des matchs terminés. La source de vérité est la collection
// matches : corriger un score recalcule tout, aucun compteur stocké à maintenir.
export function computeStandings(users, matches) {
  const stats = Object.fromEntries(
    users.map(u => [u.uid, { points: 0, victoires: 0, matchsJoues: 0 }])
  )
  const codeToUser = buildCodeToUser(users)

  for (const m of matches) {
    if (m.statut !== 'TERMINE' || m.homeScore == null || m.awayScore == null) continue
    const pts = PHASES[m.phase]?.points ?? 0
    const winner = m.homeScore > m.awayScore ? m.homeTeamCode
                 : m.awayScore > m.homeScore ? m.awayTeamCode
                 : null
    for (const code of [m.homeTeamCode, m.awayTeamCode]) {
      const s = stats[codeToUser[code]?.uid]
      if (!s) continue
      s.matchsJoues += 1
      if (code === winner) { s.victoires += 1; s.points += pts }
    }
  }

  return users
    .map(u => ({ ...u, ...stats[u.uid] }))
    .sort((a, b) =>
      b.points - a.points
      || b.victoires - a.victoires
      || (a.prenom ?? '').localeCompare(b.prenom ?? ''))
}
