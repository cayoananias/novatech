import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'
import { placeOrder } from '../services/ordersService'

const initialAddress = {
  name: '',
  email: '',
  phone: '',
  zipCode: '',
  street: '',
  number: '',
  neighborhood: '',
  city: '',
  state: '',
}

function onlyDigits(value) {
  return String(value || '').replace(/\D/g, '')
}

function validateAddress(address) {
  const errors = {}

  if (address.name.trim().split(/\s+/).length < 2) errors.name = 'Informe o nome completo.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address.email.trim())) errors.email = 'Informe um e-mail válido.'
  if (onlyDigits(address.phone).length < 10) errors.phone = 'Informe um telefone com DDD.'
  if (onlyDigits(address.zipCode).length !== 8) errors.zipCode = 'Informe um CEP válido com 8 dígitos.'
  if (address.street.trim().length < 3) errors.street = 'Informe o endereço.'
  if (!address.number.trim()) errors.number = 'Informe o número.'
  if (address.neighborhood.trim().length < 2) errors.neighborhood = 'Informe o bairro.'
  if (address.city.trim().length < 2) errors.city = 'Informe a cidade.'
  if (!/^[A-Za-z]{2}$/.test(address.state.trim())) errors.state = 'Informe a UF com 2 letras.'

  return errors
}

export function CheckoutPage() {
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const { items, subtotalLabel, totalLabel, itemCount, clearCart } = useCart()
  const [paymentMethod, setPaymentMethod] = useState('pix')
  const [shippingAddress, setShippingAddress] = useState(() => ({ ...initialAddress, email: currentUser?.email || '' }))
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const totals = useMemo(() => {
    const subtotal = items.reduce((total, item) => total + Number(item.price) * Number(item.quantity), 0)
    return { subtotal, total: subtotal, itemCount }
  }, [itemCount, items])

  if (!currentUser) {
    return (
      <div className="page page--empty">
        <h1>Você precisa entrar para finalizar o pedido</h1>
        <Link to="/login?redirect=/checkout" className="button button--primary">Fazer login</Link>
      </div>
    )
  }

  const updateField = (field, value) => {
    setShippingAddress((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: '' }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (submitting) return

    const nextErrors = validateAddress(shippingAddress)
    setErrors(nextErrors)
    setMessage('')

    if (Object.keys(nextErrors).length > 0) {
      setMessage('Revise os campos obrigatórios antes de finalizar a compra.')
      return
    }

    setSubmitting(true)

    try {
      await placeOrder({ user: currentUser, items, totals, paymentMethod, shippingAddress })
      clearCart()
      navigate('/perfil?order=success')
    } catch (error) {
      setMessage(error.message || 'Não foi possível finalizar o pedido.')
    } finally {
      setSubmitting(false)
    }
  }

  const renderField = (field, label, props = {}) => (
    <label className={`field-card ${errors[field] ? 'field-card--invalid' : ''}`}>
      <span>{label}</span>
      <input value={shippingAddress[field]} onChange={(event) => updateField(field, event.target.value)} aria-invalid={Boolean(errors[field])} {...props} />
      {errors[field] ? <small className="field-error">{errors[field]}</small> : null}
    </label>
  )

  return (
    <div className="page page--checkout">
      <header className="page-head"><div><span className="topbar__eyebrow">Checkout</span><h1>Confirmar pedido</h1></div></header>

      <section className="summary-card">
        <div><span>Itens</span><strong>{itemCount}</strong></div>
        <div><span>Subtotal</span><strong>{subtotalLabel}</strong></div>
        <div><span>Total</span><strong>{totalLabel}</strong></div>
      </section>

      <form className="form-stack" onSubmit={handleSubmit} noValidate>
        {renderField('name', 'Nome completo', { type: 'text', placeholder: 'Nome e sobrenome', autoComplete: 'name' })}
        {renderField('email', 'E-mail', { type: 'email', placeholder: 'seu@email.com', autoComplete: 'email' })}
        {renderField('phone', 'Telefone', { type: 'tel', placeholder: '(00) 00000-0000', autoComplete: 'tel' })}
        <div className="field-grid">{renderField('zipCode', 'CEP', { type: 'text', inputMode: 'numeric', autoComplete: 'postal-code' })}{renderField('state', 'Estado', { type: 'text', maxLength: 2, placeholder: 'UF' })}</div>
        {renderField('street', 'Endereço', { type: 'text', autoComplete: 'address-line1' })}
        <div className="field-grid">{renderField('number', 'Número', { type: 'text', autoComplete: 'address-line2' })}{renderField('neighborhood', 'Bairro', { type: 'text' })}</div>
        {renderField('city', 'Cidade', { type: 'text', autoComplete: 'address-level2' })}

        <label className="field-card"><span>Forma de pagamento</span><select value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)}><option value="pix">PIX</option><option value="card">Cartão</option><option value="mercadopago">Mercado Pago</option><option value="stripe">Stripe</option></select></label>
        {message ? <p className="form-message form-message--error">{message}</p> : null}
        <button type="submit" className="button button--primary" disabled={submitting || items.length === 0}>{submitting ? 'Processando...' : 'Finalizar compra'}</button>
      </form>
    </div>
  )
}
