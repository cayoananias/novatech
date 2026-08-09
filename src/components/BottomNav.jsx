import { NavLink } from 'react-router-dom'

export function BottomNav({ items, cartCount = 0 }) {
  return (
    <nav className="bottom-nav" aria-label="Navegação principal">
      {items.map((item) => (
        <NavLink key={item.to} to={item.to} className={({ isActive }) => `bottom-nav__item ${isActive ? 'is-active' : ''}`} end={item.end}>
          <span className="bottom-nav__icon" aria-hidden="true">
            {item.icon}
          </span>
          <span className="bottom-nav__label">{item.label}</span>
          {item.badge === 'cart' && cartCount > 0 ? <span className="bottom-nav__badge">{cartCount}</span> : null}
        </NavLink>
      ))}
    </nav>
  )
}