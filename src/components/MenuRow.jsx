export function MenuRow({ icon, label, danger = false, onClick }) {
  return (
    <button type="button" className={`menu-row ${danger ? 'is-danger' : ''}`} onClick={onClick}>
      <span className="menu-row__icon" aria-hidden="true">
        {icon}
      </span>
      <span className="menu-row__label">{label}</span>
      <span className="menu-row__arrow" aria-hidden="true">
        ›
      </span>
    </button>
  )
}
