import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCurrentUser } from '../hooks/useCurrentUser'

const links = [
  { to: '/dashboard',    icon: '🏠', label: 'Accueil' },
  { to: '/matchs',       icon: '🏉', label: 'Matchs'  },
  { to: '/chat/general', icon: '💬', label: 'Chat'    },
  { to: '/profil',       icon: '👤', label: 'Profil'  },
]

export default function NavBar() {
  const { user } = useAuth()
  const profile  = useCurrentUser(user?.uid)
  const isAdmin  = profile?.isAdmin === true

  const allLinks = isAdmin
    ? [...links, { to: '/admin', icon: '⚙️', label: 'Admin' }]
    : links

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50"
         style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="max-w-lg mx-auto flex">
        {allLinks.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center py-2 gap-0.5 text-xs transition-colors ${
                isActive ? 'text-orange-rwc' : 'text-warm-gray'
              }`
            }
          >
            <span className="text-xl leading-none">{icon}</span>
            <span className="font-medium">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
