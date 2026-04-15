export default function LoadingSpinner({ label = 'Chargement…' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <div className="w-8 h-8 border-4 border-orange-rwc border-t-transparent rounded-full animate-spin" />
      <p className="text-warm-gray text-sm">{label}</p>
    </div>
  )
}
