// Icône « duel » en SVG plat (2 ellipses + étincelle) : contrairement à un
// visuel généré (raster), elle reste nette à n'importe quelle taille, y
// compris les 14-16px utilisés ici — remplace l'emoji ⚔️ (rendu incohérent
// selon OS/police) par un repère visuel propre aux couleurs de la marque.
export default function DuelIcon({ size = 16, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={`inline-block align-[-2px] ${className}`} aria-hidden="true">
      <ellipse cx="9" cy="12" rx="7" ry="4.2" fill="#E8401C" transform="rotate(-25 9 12)" />
      <ellipse cx="15" cy="12" rx="7" ry="4.2" fill="#0E7C7B" transform="rotate(25 15 12)" />
      <polygon points="12,7.5 13.5,11 17,12 13.5,13 12,16.5 10.5,13 7,12 10.5,11" fill="#D6E84B" />
    </svg>
  )
}
