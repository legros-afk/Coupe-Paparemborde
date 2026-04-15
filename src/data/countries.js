export const PAYS = [
  { code: 'AUS', nom: 'Australie',         drapeau: '🇦🇺', confederation: 'Océanie' },
  { code: 'NZL', nom: 'Nouvelle-Zélande',  drapeau: '🇳🇿', confederation: 'Océanie' },
  { code: 'RSA', nom: 'Afrique du Sud',    drapeau: '🇿🇦', confederation: 'Afrique' },
  { code: 'ENG', nom: 'Angleterre',        drapeau: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', confederation: 'Europe' },
  { code: 'IRE', nom: 'Irlande',           drapeau: '🇮🇪', confederation: 'Europe' },
  { code: 'FRA', nom: 'France',            drapeau: '🇫🇷', confederation: 'Europe' },
  { code: 'ARG', nom: 'Argentine',         drapeau: '🇦🇷', confederation: 'Amériques' },
  { code: 'FIJ', nom: 'Fidji',             drapeau: '🇫🇯', confederation: 'Océanie' },
  { code: 'SCO', nom: 'Écosse',            drapeau: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', confederation: 'Europe' },
  { code: 'WAL', nom: 'Pays de Galles',    drapeau: '🏴󠁧󠁢󠁷󠁬󠁳󠁿', confederation: 'Europe' },
  { code: 'GEO', nom: 'Géorgie',           drapeau: '🇬🇪', confederation: 'Europe' },
  { code: 'JAP', nom: 'Japon',             drapeau: '🇯🇵', confederation: 'Asie' },
  { code: 'ITA', nom: 'Italie',            drapeau: '🇮🇹', confederation: 'Europe' },
  { code: 'POR', nom: 'Portugal',          drapeau: '🇵🇹', confederation: 'Europe' },
  { code: 'SAM', nom: 'Samoa',             drapeau: '🇼🇸', confederation: 'Océanie' },
  { code: 'TON', nom: 'Tonga',             drapeau: '🇹🇴', confederation: 'Océanie' },
  { code: 'URU', nom: 'Uruguay',           drapeau: '🇺🇾', confederation: 'Amériques' },
  { code: 'ROM', nom: 'Roumanie',          drapeau: '🇷🇴', confederation: 'Europe' },
  { code: 'USA', nom: 'États-Unis',        drapeau: '🇺🇸', confederation: 'Amériques' },
  { code: 'CHI', nom: 'Chili',             drapeau: '🇨🇱', confederation: 'Amériques' },
  { code: 'NAM', nom: 'Namibie',           drapeau: '🇳🇦', confederation: 'Afrique' },
  { code: 'ESP', nom: 'Espagne',           drapeau: '🇪🇸', confederation: 'Europe' },
  { code: 'CAN', nom: 'Canada',            drapeau: '🇨🇦', confederation: 'Amériques' },
  { code: 'HKG', nom: 'Hong Kong',         drapeau: '🇭🇰', confederation: 'Asie' },
]

export const PAR_CODE = Object.fromEntries(PAYS.map(p => [p.code, p]))

export function drapeau(code) { return PAR_CODE[code]?.drapeau ?? '🏉' }
export function nom(code)     { return PAR_CODE[code]?.nom ?? code }
