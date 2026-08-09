import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'
import { placeOrder } from '../services/ordersService'

export function CheckoutPage() {
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const { items, subtotalLabel, totalLabel, itemCount, clearCart } = useCart()
  const [paymentMethod, setPaymentMethod] = useState('pix')
  const [shippingAddress, setShippingAddress] = useState({ name: '', street: '', city: '', state: '', zipCode: '' })
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (!currentUser) {
    return (
      <div className="page page--empty">
        <h1>Você precisa entrar para finalizar o pedido</h1>
        <Link to="/login?redirect=/checkout" className="button button--primary">
          Fazer login
        </Link>
      </div>
    )
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setMessage('')

    try {
      await placeOrder({
        user: currentUser,
        items,
        totals: {
          subtotal: items.reduce((total, item) => total + item.price * item.quantity, 0),
          total: items.reduce((total, item) => total + item.price * item.quantity, 0),
          itemCount,
        },
        paymentMethod,
        shippingAddress,
      })
      clearCart()
      navigate('/perfil?order=success')
    } catch (error) {
      setMessage(error.message || 'Não foi possível finalizar o pedido.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="page page--checkout">
      <header className="page-head">
        <div>
          <span className="topbar__eyebrow">Checkout</span>
          <h1>Confirmar pedido</h1>
        </div>
      </header>

      <section className="summary-card">
        <div>
          <span>Itens</span>
          <strong>{itemCount}</strong>
        </div>
        <div>
          <span>Subtotal</span>
          <strong>{subtotalLabel}</strong>
        </div>
        <div>
          <span>Total</span>
          <strong>{totalLabel}</strong>
        </div>
      </section>

      <form className="form-stack" onSubmit={handleSubmit}>
        <label className="field-card">
          <span>Nome</span>
          <input type="text" value={shippingAddress.name} onChange={(event) => setShippingAddress((current) => ({ ...current, name: event.target.value }))} placeholder="Nome completo" />
        </label>
        <label className="field-card">
          <span>Rua / número</span>
          <input type="text" value={shippingAddress.street} onChange={(event) => setShippingAddress((current) => ({ ...current, street: event.target.value }))} placeholder="Endereço de entrega" />
        </label>
        <div className="field-grid">
          <label className="field-card">
            <span>Cidade</span>
            <input type="text" value={shippingAddress.city} onChange={(event) => setShippingAddress((current) => ({ ...current, city: event.target.value }))} />
          </label>
          <label className="field-card">
            <span>UF</span>
            <input type="text" value={shippingAddress.state} onChange={(event) => setShippingAddress((current) => ({ ...current, state: event.target.value }))} />
          </label>
        </div>

        <label className="field-card">
          <span>CEP</span>
          <input type="text" value={shippingAddress.zipCode} onChange={(event) => setShippingAddress((current) => ({ ...current, zipCode: event.target.value }))} />
        </label>

        <label className="field-card">
          <span>Forma de pagamento</span>
          <select value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)}>
            <option value="pix">PIX</option>
            <option value="card">Cartão</option>
            <option value="mercadopago">Mercado Pago</option>
            <option value="stripe">Stripe</option>
          </select>
        </label>

        {message ? <p className="form-message form-message--error">{message}</p> : null}

        <button type="submit" className="button button--primary" disabled={submitting}>
          {submitting ? 'Finalizando...' : 'Criar pedido'}
        </button>
      </form>
    </div>
  )
}