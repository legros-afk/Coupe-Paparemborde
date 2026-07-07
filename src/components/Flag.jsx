import { useState } from 'react'
import { PAR_CODE } from '../data/countries'

// Drapeau en image (flagcdn.com) : les emoji drapeaux ne s'affichent pas sous
// Windows. Retombe sur l'emoji si l'image ne charge pas (offline sans cache).
export default function Flag({ code, width = 24, className = '' }) {
  const [err, setErr] = useState(false)
  const pays = PAR_CODE[code]

  if (!pays || err) {
    return <span style={{ fontSize: Math.round(width * 0.8) }}>{pays?.drapeau ?? '🏉'}</span>
  }

  // flagcdn sert w40/w80/w160 — on prend une taille au-dessus pour les écrans retina
  const base = width <= 20 ? 40 : width <= 40 ? 80 : 160
  return (
    <img
      src={`https://flagcdn.com/w${base}/${pays.cc}.png`}
      srcSet={`https://flagcdn.com/w${base * 2 <= 160 ? base * 2 : 160}/${pays.cc}.png 2x`}
      width={width}
      alt={pays.nom}
      loading="lazy"
      onError={() => setErr(true)}
      className={`inline-block rounded-[3px] shadow-sm ${className}`}
      style={{ height: 'auto' }}
    />
  )
}
