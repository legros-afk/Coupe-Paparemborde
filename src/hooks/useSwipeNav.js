import { useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

const TABS = ['/dashboard', '/matchs', '/chat/general', '/profil']

const MIN_SWIPE_X   = 60   // minimum horizontal distance (px)
const MAX_SWIPE_Y   = 80   // maximum vertical drift allowed (px)

export function useSwipeNav() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const touchStart = useRef(null)

  useEffect(() => {
    function onTouchStart(e) {
      const t = e.touches[0]
      touchStart.current = { x: t.clientX, y: t.clientY }
    }

    function onTouchEnd(e) {
      if (!touchStart.current) return
      const t    = e.changedTouches[0]
      const dx   = t.clientX - touchStart.current.x
      const dy   = Math.abs(t.clientY - touchStart.current.y)
      touchStart.current = null

      if (Math.abs(dx) < MIN_SWIPE_X || dy > MAX_SWIPE_Y) return

      // Find current tab index (match by prefix for /chat/:id)
      const currentPath = location.pathname
      const idx = TABS.findIndex(tab =>
        currentPath === tab || (tab === '/chat/general' && currentPath.startsWith('/chat/'))
      )
      if (idx === -1) return

      if (dx < 0 && idx < TABS.length - 1) navigate(TABS[idx + 1])  // swipe left → next
      if (dx > 0 && idx > 0)               navigate(TABS[idx - 1])  // swipe right → prev
    }

    document.addEventListener('touchstart', onTouchStart, { passive: true })
    document.addEventListener('touchend',   onTouchEnd,   { passive: true })
    return () => {
      document.removeEventListener('touchstart', onTouchStart)
      document.removeEventListener('touchend',   onTouchEnd)
    }
  }, [navigate, location.pathname])
}
