import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export function RegisterPage() {
  const navigate = useNavigate()
  const { signUp, configured } = useAuth()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      await signUp(form)
      navigate('/perfil')
    } catch (error) {
      setMessage(error.message || 'Não foi possível criar a conta.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <section className="auth-card">
        <span className="auth-card__brand">NovaTech</span>
        <h1>Criar conta</h1>
        <p>O cadastro será salvo no Firebase Authentication e no Firestore.</p>

        {!configured ? <div className="notice-box">Configure as variáveis de ambiente do Firebase para habilitar cadastro real.</div> : null}

        <form className="form-stack" onSubmit={handleSubmit}>
          <label className="field-card">
            <span>Nome</span>
            <input type="text" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} placeholder="Seu nome" />
          </label>
          <label className="field-card">
            <span>E-mail</span>
            <input type="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} placeholder="seu@email.com" />
          </label>
          <label className="field-card">
            <span>Senha</span>
            <input type="password" value={form.password} onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))} placeholder="••••••••" />
          </label>

          {message ? <p className="form-message form-message--error">{message}</p> : null}

          <button type="submit" className="button button--primary" disabled={loading}>
            {loading ? 'Criando...' : 'Criar conta'}
          </button>
        </form>

        <p className="auth-card__footer">
          Já tem conta? <Link to="/login">Entrar</Link>
        </p>
      </section>
    </div>
  )
}