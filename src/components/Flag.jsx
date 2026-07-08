import { useState } from 'react'
import { PAR_CODE } from '../data/countries'
import { LOGO_CODES, logoUrl } from '../data/logos'

// Emblème d'un pays. Chaîne de repli : logo local (si fourni dans public/logos
// et listé dans data/logos.js) → drapeau flagcdn (les emoji drapeaux ne
// s'affichent pas sous Windows) → emoji en dernier recours.
export default function Flag({ code, width = 24, className = '' }) {
  const pays = PAR_CODE[code]

  const sources = []
  if (pays && LOGO_CODES.has(code)) {
    sources.push({ src: logoUrl(code), rounded: false })
  }
  if (pays) {
    const base   = width <= 20 ? 40 : width <= 40 ? 80 : 160
    const retina = Math.min(base * 2, 160)
    sources.push({
      src:    `https://flagcdn.com/w${base}/${pays.cc}.png`,
      srcSet: `https://flagcdn.com/w${retina}/${pays.cc}.png 2x`,
      rounded: true,
    })
  }

  const [stage, setStage] = useState(0)
  const current = sources[stage]

  if (!current) {
    return <span style={{ fontSize: Math.round(width * 0.8) }}>{pays?.drapeau ?? '🏉'}</span>
  }

  return (
    <img
      src={current.src}
      srcSet={current.srcSet}
      width={width}
      alt={pays.nom}
      loading="lazy"
      onError={() => setStage(s => s + 1)}
      className={`inline-block ${current.rounded ? 'rounded-[3px] shadow-sm' : 'object-contain'} ${className}`}
      style={{ height: 'auto' }}
    />
  )
}
