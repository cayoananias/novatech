export function SectionHeader({ title, actionLabel, onAction, subtitle }) {
  return (
    <div className="section-header">
      <div className="section-header__copy">
        <h3>{title}</h3>
        {subtitle ? <p>{subtitle}</p> : null}
      </div>
      {actionLabel ? (
        <button type="button" className="section-header__action" onClick={onAction}>
          {actionLabel}
        </button>
      ) : null}
    </div>
  )
}