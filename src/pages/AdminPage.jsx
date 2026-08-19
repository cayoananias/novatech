import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { MenuRow } from '../components/MenuRow'
import { SectionHeader } from '../components/SectionHeader'
import { useAuth } from '../contexts/AuthContext'
import { useProducts } from '../contexts/ProductsContext'
import { subscribeAllOrders } from '../services/ordersService'
import { subscribeUsers } from '../services/usersService'
import { formatCurrency } from '../utils/format'
import { optimizeProductImage, validateImageFile } from '../utils/imageProcessing'

const initialForm = {
  id: '',
  name: '',
  description: '',
  price: '',
  stock: '',
  imageUrl: '',
  active: true,
  featured: false,
}

export function AdminPage() {
  const { currentUser, signOut } = useAuth()
  const { products, createProduct, updateProduct, deleteProduct } = useProducts()
  const [users, setUsers] = useState([])
  const [orders, setOrders] = useState([])
  const [form, setForm] = useState(initialForm)
  const [selectedFile, setSelectedFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [imageInfo, setImageInfo] = useState('')
  const [imageError, setImageError] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => subscribeUsers(setUsers), [])
  useEffect(() => subscribeAllOrders(setOrders), [])

  const editingProduct = useMemo(() => products.find((product) => product.id === form.id) || null, [form.id, products])

  useEffect(() => {
    if (editingProduct) {
      setForm({
        id: editingProduct.id,
        name: editingProduct.name,
        description: editingProduct.description,
        price: editingProduct.price,
        stock: editingProduct.stock,
        imageUrl: editingProduct.imageUrl || '',
        active: editingProduct.active,
        featured: editingProduct.featured,
      })
    }
  }, [editingProduct])

  const handleImageChange = async (event) => {
    const file = event.target.files?.[0] || null
    setSelectedFile(null)
    setImagePreview('')
    setImageInfo('')
    setImageError('')

    if (!file) return

    const validationError = validateImageFile(file)
    if (validationError) {
      setImageError(validationError)
      return
    }

    try {
      const optimizedImage = await optimizeProductImage(file)
      setSelectedFile(optimizedImage.file)
      setImagePreview(optimizedImage.previewUrl)
      setImageInfo(`Imagem otimizada: ${(optimizedImage.optimizedSize / 1024).toFixed(0)} KB, ${optimizedImage.width}×${optimizedImage.height}px.`)
    } catch (error) {
      setImageError(error.message || 'Falha ao processar a imagem.')
    }
  }

  const resetForm = () => {
    setForm(initialForm)
    setSelectedFile(null)
    setImagePreview('')
    setImageInfo('')
    setImageError('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (saving) return

    setMessage('')
    setSaving(true)

    try {
      const payload = {
        ...form,
        imageFile: selectedFile,
      }

      if (form.id) {
        await updateProduct(form.id, payload)
        setMessage('Produto atualizado.')
      } else {
        await createProduct(payload)
        setMessage('Produto criado e sincronizado com o catálogo.')
      }

      resetForm()
    } catch (error) {
      setMessage(error.message || 'Não foi possível salvar o produto.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="page page--admin">
      <header className="page-head">
        <div>
          <span className="topbar__eyebrow">ADMIN</span>
          <h1>Painel administrativo</h1>
          <p>{currentUser?.name}</p>
        </div>
        <button type="button" className="text-link" onClick={signOut}>
          Sair
        </button>
      </header>

      <section className="admin-summary">
        <div className="admin-summary__card">
          <strong>{products.length}</strong>
          <span>Produtos</span>
        </div>
        <div className="admin-summary__card">
          <strong>{users.length}</strong>
          <span>Usuários</span>
        </div>
        <div className="admin-summary__card">
          <strong>{orders.length}</strong>
          <span>Pedidos</span>
        </div>
      </section>

      <section className="section-block">
        <SectionHeader title={form.id ? 'Editar produto' : 'Adicionar produto'} subtitle="Sincroniza com Firestore quando configurado" />

        <form className="form-stack" onSubmit={handleSubmit}>
          <label className="field-card">
            <span>Nome</span>
            <input type="text" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
          </label>
          <label className="field-card field-card--textarea">
            <span>Descrição</span>
            <textarea value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} rows="4" />
          </label>
          <div className="field-grid">
            <label className="field-card">
              <span>Preço</span>
              <input type="number" step="0.01" value={form.price} onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))} />
            </label>
            <label className="field-card">
              <span>Estoque</span>
              <input type="number" min="0" value={form.stock} onChange={(event) => setForm((current) => ({ ...current, stock: event.target.value }))} />
            </label>
          </div>
          <label className="field-card">
            <span>Imagem</span>
            <input type="url" value={form.imageUrl} onChange={(event) => setForm((current) => ({ ...current, imageUrl: event.target.value }))} placeholder="https://..." />
          </label>
          <label className="field-card">
            <span>Ou enviar arquivo para Firebase Storage</span>
            <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageChange} />
            {imagePreview || form.imageUrl ? <img className="image-preview" src={imagePreview || form.imageUrl} alt="Prévia do produto" /> : null}
            {imageInfo ? <small className="field-hint">{imageInfo}</small> : null}
            {imageError ? <small className="field-error">{imageError}</small> : null}
          </label>
          <div className="toggle-row">
            <label>
              <input type="checkbox" checked={form.active} onChange={(event) => setForm((current) => ({ ...current, active: event.target.checked }))} />
              Ativo
            </label>
            <label>
              <input type="checkbox" checked={form.featured} onChange={(event) => setForm((current) => ({ ...current, featured: event.target.checked }))} />
              Em destaque
            </label>
          </div>

          {message ? <p className="form-message">{message}</p> : null}

          <div className="auth-actions">
            <button type="submit" className="button button--primary" disabled={saving || Boolean(imageError)}>
              {saving ? 'Salvando...' : form.id ? 'Salvar alterações' : 'Adicionar produto'}
            </button>
            {form.id ? (
              <button type="button" className="button button--ghost button--ghost-dark" onClick={resetForm}>
                Cancelar edição
              </button>
            ) : null}
          </div>
        </form>
      </section>

      <section className="section-block">
        <SectionHeader title="Produtos cadastrados" subtitle="Atualização em tempo real quando o Firestore estiver conectado" />
        <div className="admin-list">
          {products.map((product) => (
            <article key={product.id} className="admin-product-card">
              <img src={product.imageUrl} alt={product.imageAlt || product.name} />
              <div>
                <strong>{product.name}</strong>
                <p>{product.description}</p>
                <span>{formatCurrency(product.price)} · Estoque {product.stock}</span>
              </div>
              <div className="admin-product-card__actions">
                <MenuRow icon="✏️" label="Editar" onClick={() => { setForm({ ...product, price: product.price, stock: product.stock }); setImagePreview(''); setImageInfo(''); setImageError('') }} />
                <MenuRow icon="🗑️" label="Excluir" onClick={() => deleteProduct(product.id)} danger />
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section-block">
        <SectionHeader title="Usuários" subtitle="Dados vindos da coleção users" />
        <div className="admin-list admin-list--compact">
          {users.map((user) => (
            <article key={user.id} className="admin-line">
              <strong>{user.name || user.email}</strong>
              <span>{user.email}</span>
              <span>{user.role}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="section-block">
        <SectionHeader title="Pedidos" subtitle="Monitoramento da coleção orders" />
        <div className="admin-list admin-list--compact">
          {orders.map((order) => (
            <article key={order.id} className="admin-line">
              <strong>{order.userName || order.userEmail}</strong>
              <span>{order.itemCount} item(ns)</span>
              <span>{formatCurrency(order.total)}</span>
            </article>
          ))}
        </div>
      </section>

      <div className="admin-footer">
        <Link to="/" className="button button--ghost button--ghost-dark">
          Voltar para loja
        </Link>
      </div>
    </div>
  )
}
