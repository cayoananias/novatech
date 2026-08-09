import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export function LoginPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { signIn, configured } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const redirectTo = searchParams.get('redirect') || '/perfil'

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      await signIn(form)
      navigate(redirectTo)
    } catch (error) {
      setMessage(error.message || 'Não foi possível entrar.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <section className="auth-card">
        <span className="auth-card__brand">NovaTech</span>
        <h1>Entrar</h1>
        <p>A autenticação real será feita via Firebase Authentication.</p>

        {!configured ? <div className="notice-box">Configure as variáveis de ambiente do Firebase para habilitar login real.</div> : null}

        <form className="form-stack" onSubmit={handleSubmit}>
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
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="auth-card__footer">
          Não tem conta? <Link to="/cadastro">Criar agora</Link>
        </p>
      </section>
    </div>
  )
}