// cc = code flagcdn.com (images de drapeaux — les emoji drapeaux ne s'affichent
// pas sous Windows, on ne les garde que pour les contextes texte : <option>, toasts)
export const PAYS = [
  { code: 'AUS', cc: 'au',     nom: 'Australie',         drapeau: '🇦🇺', confederation: 'Océanie' },
  { code: 'NZL', cc: 'nz',     nom: 'Nouvelle-Zélande',  drapeau: '🇳🇿', confederation: 'Océanie' },
  { code: 'RSA', cc: 'za',     nom: 'Afrique du Sud',    drapeau: '🇿🇦', confederation: 'Afrique' },
  { code: 'ENG', cc: 'gb-eng', nom: 'Angleterre',        drapeau: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', confederation: 'Europe' },
  { code: 'IRE', cc: 'ie',     nom: 'Irlande',           drapeau: '🇮🇪', confederation: 'Europe' },
  { code: 'FRA', cc: 'fr',     nom: 'France',            drapeau: '🇫🇷', confederation: 'Europe' },
  { code: 'ARG', cc: 'ar',     nom: 'Argentine',         drapeau: '🇦🇷', confederation: 'Amériques' },
  { code: 'FIJ', cc: 'fj',     nom: 'Fidji',             drapeau: '🇫🇯', confederation: 'Océanie' },
  { code: 'SCO', cc: 'gb-sct', nom: 'Écosse',            drapeau: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', confederation: 'Europe' },
  { code: 'WAL', cc: 'gb-wls', nom: 'Pays de Galles',    drapeau: '🏴󠁧󠁢󠁷󠁬󠁳󠁿', confederation: 'Europe' },
  { code: 'GEO', cc: 'ge',     nom: 'Géorgie',           drapeau: '🇬🇪', confederation: 'Europe' },
  { code: 'JAP', cc: 'jp',     nom: 'Japon',             drapeau: '🇯🇵', confederation: 'Asie' },
  { code: 'ITA', cc: 'it',     nom: 'Italie',            drapeau: '🇮🇹', confederation: 'Europe' },
  { code: 'POR', cc: 'pt',     nom: 'Portugal',          drapeau: '🇵🇹', confederation: 'Europe' },
  { code: 'SAM', cc: 'ws',     nom: 'Samoa',             drapeau: '🇼🇸', confederation: 'Océanie' },
  { code: 'TON', cc: 'to',     nom: 'Tonga',             drapeau: '🇹🇴', confederation: 'Océanie' },
  { code: 'URU', cc: 'uy',     nom: 'Uruguay',           drapeau: '🇺🇾', confederation: 'Amériques' },
  { code: 'ROM', cc: 'ro',     nom: 'Roumanie',          drapeau: '🇷🇴', confederation: 'Europe' },
  { code: 'USA', cc: 'us',     nom: 'États-Unis',        drapeau: '🇺🇸', confederation: 'Amériques' },
  { code: 'CHI', cc: 'cl',     nom: 'Chili',             drapeau: '🇨🇱', confederation: 'Amériques' },
  { code: 'NAM', cc: 'na',     nom: 'Namibie',           drapeau: '🇳🇦', confederation: 'Afrique' },
  { code: 'ZIM', cc: 'zw',     nom: 'Zimbabwe',          drapeau: '🇿🇼', confederation: 'Afrique' },
  { code: 'ESP', cc: 'es',     nom: 'Espagne',           drapeau: '🇪🇸', confederation: 'Europe' },
  { code: 'CAN', cc: 'ca',     nom: 'Canada',            drapeau: '🇨🇦', confederation: 'Amériques' },
  { code: 'HKG', cc: 'hk',     nom: 'Hong Kong',         drapeau: '🇭🇰', confederation: 'Asie' },
]

export const PAR_CODE = Object.fromEntries(PAYS.map(p => [p.code, p]))

export function drapeau(code) { return PAR_CODE[code]?.drapeau ?? '🏉' }
export function nom(code)     { return PAR_CODE[code]?.nom ?? code }
