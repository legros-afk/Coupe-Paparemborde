import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import NavBar from './components/NavBar'
import { useSwipeNav } from './hooks/useSwipeNav'
import LoginPage    from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import MatchesPage   from './pages/MatchesPage'
import ChatPage      from './pages/ChatPage'
import ProfilePage   from './pages/ProfilePage'
import AdminPage     from './pages/AdminPage'
import LoadingSpinner from './components/LoadingSpinner'

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <LoadingSpinner label="Chargement…" />
  return user ? children : <Navigate to="/login" replace />
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <LoadingSpinner label="Chargement…" />
  return user ? <Navigate to="/dashboard" replace /> : children
}

function AppLayout({ children }) {
  useSwipeNav()
  return (
    <div className="max-w-lg mx-auto min-h-screen relative">
      {children}
      <NavBar />
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login"    element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

      {/* Private */}
      <Route path="/dashboard" element={
        <PrivateRoute><AppLayout><DashboardPage /></AppLayout></PrivateRoute>
      } />
      <Route path="/matchs" element={
        <PrivateRoute><AppLayout><MatchesPage /></AppLayout></PrivateRoute>
      } />
      <Route path="/chat/:salonId" element={
        <PrivateRoute><ChatPage /></PrivateRoute>
      } />
      <Route path="/profil" element={
        <PrivateRoute><AppLayout><ProfilePage /></AppLayout></PrivateRoute>
      } />
      <Route path="/admin" element={
        <PrivateRoute><AdminPage /></PrivateRoute>
      } />

      {/* Default */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
