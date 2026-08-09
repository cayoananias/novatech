import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export function RequireAuth({ children }) {
  const { ready, isAuthenticated } = useAuth()
  const location = useLocation()

  if (!ready) {
    return <div className="status-page">Carregando sessão...</div>
  }

  if (!isAuthenticated) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />
  }

  return children
}

export function RequireAdmin({ children }) {
  const { ready, isAuthenticated, isAdmin } = useAuth()
  const location = useLocation()

  if (!ready) {
    return <div className="status-page">Carregando sessão...</div>
  }

  if (!isAuthenticated) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />
  }

  return children
}