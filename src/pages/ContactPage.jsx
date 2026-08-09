import { useState } from 'react'
import { createContactMessage } from '../services/contactsService'

export function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [status, setStatus] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setStatus('')

    try {
      await createContactMessage(form)
      setForm({ name: '', email: '', message: '' })
      setStatus('Mensagem enviada com sucesso.')
    } catch (error) {
      setStatus(error.message || 'Não foi possível enviar a mensagem.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="page page--contact">
      <header className="page-head">
        <div>
          <span className="topbar__eyebrow">Contato</span>
          <h1>Fale com a loja</h1>
        </div>
      </header>

      <form className="form-stack" onSubmit={handleSubmit}>
        <label className="field-card">
          <span>Nome</span>
          <input type="text" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} placeholder="Seu nome" />
        </label>
        <label className="field-card">
          <span>E-mail</span>
          <input type="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} placeholder="seu@email.com" />
        </label>
        <label className="field-card field-card--textarea">
          <span>Mensagem</span>
          <textarea value={form.message} onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))} placeholder="Como podemos ajudar?" rows="5" />
        </label>

        {status ? <p className="form-message">{status}</p> : null}

        <button type="submit" className="button button--primary" disabled={submitting}>
          {submitting ? 'Enviando...' : 'Enviar mensagem'}
        </button>
      </form>
    </div>
  )
}