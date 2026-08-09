export function CategoryCard({ icon, title, subtitle, onClick }) {
  return (
    <button type="button" className="category-card" onClick={onClick}>
      <span className="category-card__icon" aria-hidden="true">
        {icon}
      </span>
      <span className="category-card__body">
        <strong>{title}</strong>
        <span>{subtitle}</span>
      </span>
      <span className="category-card__arrow" aria-hidden="true">
        ›
      </span>
    </button>
  )
}