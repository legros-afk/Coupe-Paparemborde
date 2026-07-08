// Logos d'équipe optionnels.
//
// Pour utiliser un logo à la place du drapeau pour un pays :
//   1. Déposez le fichier dans public/logos/<CODE>.png  (ex. public/logos/FRA.png)
//      — CODE = le code interne de data/countries.js (FRA, NZL, JAP, …)
//   2. Ajoutez ce même code à l'ensemble ci-dessous.
//
// Tant qu'un code n'est pas listé ici, le drapeau flagcdn continue d'être utilisé.
// N'ajoutez que des logos dont vous avez le droit d'usage (les blasons des
// fédérations sont des marques déposées).
export const LOGO_CODES = new Set([
  // 'FRA', 'NZL', 'RSA', …
])

export function logoUrl(code) {
  return `/logos/${code}.png`
}
