import { Link, useNavigate } from 'react-router-dom'
import { CartItemRow } from '../components/CartItemRow'
import { useCart } from '../contexts/CartContext'

export function CartPage() {
  const navigate = useNavigate()
  const { items, itemCount, subtotalLabel, totalLabel, updateQuantity, removeItem, clearCart } = useCart()

  const increase = (itemId) => {
    const item = items.find((cartItem) => cartItem.id === itemId)
    if (!item) {
      return
    }

    updateQuantity(itemId, item.quantity + 1)
  }

  const decrease = (itemId) => {
    const item = items.find((cartItem) => cartItem.id === itemId)
    if (!item) {
      return
    }

    updateQuantity(itemId, item.quantity - 1)
  }

  if (items.length === 0) {
    return (
      <div className="page page--empty">
        <h1>Seu carrinho está vazio</h1>
        <p>Adicione brinquedos eletrônicos reciclados para continuar.</p>
        <Link to="/produtos" className="button button--primary">
          Continuar comprando
        </Link>
      </div>
    )
  }

  return (
    <div className="page page--cart">
      <header className="page-head">
        <div>
          <span className="topbar__eyebrow">Carrinho</span>
          <h1>{itemCount} item(ns)</h1>
        </div>
        <button type="button" className="text-link" onClick={clearCart}>
          Limpar
        </button>
      </header>

      <div className="stack">
        {items.map((item) => (
          <CartItemRow key={item.id} item={item} onIncrease={increase} onDecrease={decrease} onRemove={removeItem} />
        ))}
      </div>

      <section className="summary-card">
        <div>
          <span>Subtotal</span>
          <strong>{subtotalLabel}</strong>
        </div>
        <div>
          <span>Total</span>
          <strong>{totalLabel}</strong>
        </div>
        <div className="summary-card__actions">
          <Link to="/produtos" className="button button--ghost button--ghost-dark">
            Continuar comprando
          </Link>
          <button type="button" className="button button--primary" onClick={() => navigate('/checkout')}>
            Finalizar pedido
          </button>
        </div>
      </section>
    </div>
  )
}