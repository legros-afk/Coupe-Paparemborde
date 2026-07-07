export const COLLECTION_USERS   = 'users'
export const COLLECTION_MATCHES = 'matches'

export const DB_CHATS = 'chats'

export const PHASES = {
  PHASE_DE_POULES: { label: 'Phase de poules',      emoji: '🏟️', points: 3,  color: 'bg-teal-rwc text-white' },
  HUITIEMES:       { label: 'Huitièmes de finale',  emoji: '🔟', points: 5,  color: 'bg-phase-huitiemes text-white' },
  QUARTS:          { label: 'Quarts de finale',     emoji: '⚡', points: 8,  color: 'bg-orange-rwc text-white' },
  DEMIS:           { label: 'Demi-finales',         emoji: '🔥', points: 13, color: 'bg-orange-dark text-white' },
  FINALE:          { label: 'Finale',               emoji: '🏆', points: 21, color: 'bg-lime-rwc text-warm-black' },
  TROISIEME_PLACE: { label: 'Match pour la 3e place', emoji: '🥉', points: 0,  color: 'bg-gray-400 text-white' },
}
