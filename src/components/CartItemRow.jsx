import { formatCurrency } from '../utils/format'

export function CartItemRow({ item, onIncrease, onDecrease, onRemove }) {
  return (
    <article className="cart-item">
      <img className="cart-item__image" src={item.imageUrl} alt={item.imageAlt || item.name} loading="lazy" />

      <div className="cart-item__body">
        <div className="cart-item__head">
          <strong>{item.name}</strong>
          <button type="button" className="cart-item__remove" onClick={() => onRemove(item.id)}>
            Remover
          </button>
        </div>

        <p>{item.description}</p>

        <div className="cart-item__footer">
          <div className="quantity-stepper">
            <button type="button" className="quantity-stepper__button" onClick={() => onDecrease(item.id)} aria-label={`Diminuir quantidade de ${item.name}`}>
              -
            </button>
            <span className="quantity-stepper__value">{item.quantity}</span>
            <button type="button" className="quantity-stepper__button" onClick={() => onIncrease(item.id)} aria-label={`Aumentar quantidade de ${item.name}`} disabled={item.quantity >= item.stock}>
              +
            </button>
          </div>

          <div className="cart-item__price">
            <span>{formatCurrency(item.price)}</span>
            <strong>{formatCurrency(item.price * item.quantity)}</strong>
          </div>
        </div>
      </div>
    </article>
  )
}