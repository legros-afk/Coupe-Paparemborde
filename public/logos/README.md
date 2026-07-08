# Logos d'équipe (optionnel)

Par défaut l'application affiche les **drapeaux** des pays. Vous pouvez remplacer
le drapeau d'un pays par un logo/blason d'équipe :

1. Déposez l'image ici sous le nom `<CODE>.png` — par exemple `FRA.png`, `NZL.png`.
   Le CODE est le code interne défini dans `src/data/countries.js`
   (FRA, NZL, RSA, ENG, IRE, ARG, FIJ, SCO, WAL, GEO, JAP, ITA, POR, SAM, TON,
   URU, ROM, USA, CHI, NAM, ZIM, ESP, CAN, HKG, AUS).
   Format conseillé : PNG carré à fond transparent, ~160×160 px.

2. Ajoutez le même code à l'ensemble `LOGO_CODES` dans `src/data/logos.js`.

Tant qu'un code n'est pas listé, son drapeau reste utilisé. Si le fichier logo
est manquant ou ne charge pas, l'application retombe automatiquement sur le
drapeau puis sur l'emoji.

⚠️ N'utilisez que des images dont vous avez le droit d'usage : les blasons des
fédérations et de World Rugby sont des marques déposées.
