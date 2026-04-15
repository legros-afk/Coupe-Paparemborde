export default function PhotoProfil({ url, prenom, size = 48 }) {
  const initiale = prenom?.charAt(0)?.toUpperCase() ?? '?'
  const style    = { width: size, height: size, fontSize: size * 0.4 }

  return (
    <div
      style={style}
      className="rounded-full ring-2 ring-teal-rwc overflow-hidden flex-shrink-0 flex items-center justify-center bg-orange-rwc text-white font-bold"
    >
      {url
        ? <img src={url} alt={prenom} className="w-full h-full object-cover" />
        : <span>{initiale}</span>
      }
    </div>
  )
}
