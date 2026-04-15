export default function StatutBadge({ statut }) {
  if (statut === 'EN_COURS') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 text-red-600 text-xs font-semibold">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
        En direct
      </span>
    )
  }
  if (statut === 'TERMINE') {
    return (
      <span className="px-2 py-0.5 rounded-full bg-gray-200 text-gray-600 text-xs font-semibold">
        Terminé
      </span>
    )
  }
  return (
    <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
      À venir
    </span>
  )
}
