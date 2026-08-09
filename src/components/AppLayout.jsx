import { Outlet } from 'react-router-dom'
import { BottomNav } from './BottomNav'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'

const navItems = [
  { to: '/', label: 'Início', icon: '🏠', end: true },
  { to: '/produtos', label: 'Produtos', icon: '🧸' },
  { to: '/carrinho', label: 'Carrinho', icon: '🛒', badge: 'cart' },
  { to: '/contato', label: 'Contato', icon: '📞' },
  { to: '/perfil', label: 'Perfil', icon: '👤' },
]

export function AppLayout() {
  const { itemCount } = useCart()
  const { currentUser, isAdmin } = useAuth()

  return (
    <div className="app-frame">
      <main className="app-frame__content">
        <Outlet />
      </main>

      <BottomNav items={navItems} cartCount={itemCount} />

      {currentUser && isAdmin ? <div className="admin-quick-link">Admin logado</div> : null}
    </div>
  )
}