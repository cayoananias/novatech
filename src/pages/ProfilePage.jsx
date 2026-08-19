import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { subscribeUserOrders } from '../services/ordersService'
import { formatCurrency, formatDate } from '../utils/format'

export function ProfilePage() {
  const { currentUser, isAuthenticated, isAdmin, signOut, updateProfile } = useAuth()
  const [searchParams] = useSearchParams()
  const [orders, setOrders] = useState([])
  const [profileForm, setProfileForm] = useState({ name: '', phone: '' })
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!currentUser) {
      return
    }

    setProfileForm({
      name: currentUser.name || '',
      phone: currentUser.phone || '',
    })

    const unsubscribe = subscribeUserOrders(currentUser.uid, setOrders)
    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe()
      }
    }
  }, [currentUser])

  if (!isAuthenticated) {
    return (
      <div className="page page--empty">
        <h1>Perfil</h1>
        <p>Faça login para visualizar seus dados, pedidos e conta.</p>
        <div className="auth-actions">
          <Link to="/login" className="button button--primary">
            Entrar
          </Link>
          <Link to="/cadastro" className="button button--ghost button--ghost-dark">
            Criar conta
          </Link>
        </div>
      </div>
    )
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setMessage('')

    try {
      await updateProfile(profileForm)
      setMessage('Perfil atualizado.')
    } catch (error) {
      setMessage(error.message || 'Não foi possível atualizar o perfil.')
    }
  }

  return (
    <div className="page page--profile">
      {searchParams.get('order') === 'success' ? <div className="notice-box notice-box--success">Pedido criado com sucesso.</div> : null}

      <section className="profile-card">
        <div className="profile-card__avatar">{currentUser.name?.slice(0, 2).toUpperCase() || 'CA'}</div>
        <div>
          <span className="topbar__eyebrow">Conta</span>
          <h1>{currentUser.name || 'Usuário NovaTech'}</h1>
          <p>{currentUser.email}</p>
        </div>
      </section>

      <form className="form-stack" onSubmit={handleSubmit}>
        <label className="field-card">
          <span>Nome</span>
          <input type="text" value={profileForm.name} onChange={(event) => setProfileForm((current) => ({ ...current, name: event.target.value }))} />
        </label>
        <label className="field-card">
          <span>Telefone</span>
          <input type="text" value={profileForm.phone} onChange={(event) => setProfileForm((current) => ({ ...current, phone: event.target.value }))} />
        </label>
        <div className="auth-actions">
          <button type="submit" className="button button--primary">
            Salvar alterações
          </button>
          <button type="button" className="button button--ghost button--ghost-dark" onClick={signOut}>
            Sair
          </button>
        </div>
        {message ? <p className="form-message">{message}</p> : null}
      </form>

      <section className="section-block">
        <SectionTitle title="Pedidos" subtitle="Seu histórico de compras" />
        {orders.length === 0 ? <p className="muted-text">Nenhum pedido realizado ainda.</p> : null}
        <div className="order-list">
          {orders.map((order) => (
            <article key={order.id} className="order-card">
              <div>
                <strong>Pedido {order.id.slice(0, 8)}</strong>
                <p>{formatDate(order.createdAt)}</p>
              </div>
              <div>
                <span>{order.itemCount} item(ns)</span>
                <strong>{formatCurrency(order.total)}</strong>
              </div>
            </article>
          ))}
        </div>
      </section>

      {isAdmin ? (
        <section className="section-block">
          <SectionTitle title="Acesso administrativo" subtitle="Usuário com papel admin" />
          <Link to="/admin" className="button button--primary">
            Abrir painel administrativo
          </Link>
        </section>
      ) : null}
    </div>
  )
}

function SectionTitle({ title, subtitle }) {
  return (
    <div className="section-title-block">
      <h2>{title}</h2>
      <p>{subtitle}</p>
    </div>
  )
}
