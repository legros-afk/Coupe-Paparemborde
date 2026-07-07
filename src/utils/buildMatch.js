import { PHASES } from '../constants'
import { PAR_CODE, nom } from '../data/countries'

const STATUTS = ['PLANIFIE', 'EN_COURS', 'TERMINE']

// Clé de contenu pour détecter les doublons à l'import (même affiche, même phase)
export function matchKey(m) {
  return `${m.phase}|${m.groupe || ''}|${m.homeTeamCode}|${m.awayTeamCode}`
}

// ID de document déterministe : réimporter le même match écrase au lieu de dupliquer
export function matchDocId(m) {
  return [m.phase, m.groupe || 'X', m.homeTeamCode, m.awayTeamCode].join('_')
}

// Valide et normalise un match avant écriture Firestore.
// Une phase ou un code équipe invalide fausserait silencieusement les points
// (PHASES[phase] introuvable → 0 point) : on refuse ici avec un message précis.
export function buildMatch(input) {
  const home = input.homeTeamCode
  const away = input.awayTeamCode
  if (!PAR_CODE[home]) throw new Error(`code équipe inconnu « ${home} »`)
  if (!PAR_CODE[away]) throw new Error(`code équipe inconnu « ${away} »`)
  if (home === away)   throw new Error(`même équipe des deux côtés (${home})`)

  const phase = input.phase ?? 'PHASE_DE_POULES'
  if (!PHASES[phase]) {
    throw new Error(`phase inconnue « ${phase} » (valides : ${Object.keys(PHASES).join(', ')})`)
  }

  const statut = input.statut ?? 'PLANIFIE'
  if (!STATUTS.includes(statut)) throw new Error(`statut inconnu « ${statut} »`)

  const ts = Number(input.dateTimestamp ?? 0)
  if (!Number.isFinite(ts)) throw new Error(`dateTimestamp invalide « ${input.dateTimestamp} »`)

  return {
    homeTeamCode:  home,
    awayTeamCode:  away,
    homeTeamName:  input.homeTeamName ?? nom(home),
    awayTeamName:  input.awayTeamName ?? nom(away),
    phase,
    groupe:        String(input.groupe ?? '').toUpperCase().slice(0, 1),
    stade:         input.stade ?? '',
    ville:         input.ville ?? '',
    dateTimestamp: ts,
    statut,
    homeScore:     null,
    awayScore:     null,
    sportsDbId:    '',
  }
}
