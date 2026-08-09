import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ProductCard } from '../components/ProductCard'
import { SectionHeader } from '../components/SectionHeader'
import { useCart } from '../contexts/CartContext'
import { useProducts } from '../contexts/ProductsContext'
import { ensureProductImage } from '../data/products'
import { formatCurrency } from '../utils/format'

export function ProductDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { getById, products } = useProducts()
  const { addItem } = useCart()
  const product = getById(id)
  const [quantity, setQuantity] = useState(1)

  const relatedProducts = useMemo(() => products.filter((item) => item.id !== id).slice(0, 4), [id, products])

  if (!product) {
    return (
      <div className="page page--empty">
        <h1>Produto não encontrado</h1>
        <Link to="/produtos" className="button button--primary">
          Voltar para produtos
        </Link>
      </div>
    )
  }

  const imageSource = ensureProductImage(product)

  const decrease = () => setQuantity((current) => Math.max(1, current - 1))
  const increase = () => setQuantity((current) => Math.min(product.stock, current + 1))

  return (
    <div className="page page--detail">
      <button type="button" className="back-link" onClick={() => navigate('/produtos')}>
        ← Voltar
      </button>

      <section className="detail-card">
        <img className="detail-card__image" src={imageSource} alt={product.imageAlt || product.name} />

        <div className="detail-card__body">
          <span className="eyebrow">{product.categoryLabel}</span>
          <h1>{product.name}</h1>
          <p>{product.description}</p>

          <div className="detail-stats">
            <div>
              <span>Preço</span>
              <strong>{formatCurrency(product.price)}</strong>
            </div>
            <div>
              <span>Estoque</span>
              <strong>{product.stock}</strong>
            </div>
          </div>

          <div className="quantity-stepper quantity-stepper--detail">
            <button type="button" className="quantity-stepper__button" onClick={decrease}>
              -
            </button>
            <span className="quantity-stepper__value">{quantity}</span>
            <button type="button" className="quantity-stepper__button" onClick={increase} disabled={quantity >= product.stock}>
              +
            </button>
          </div>

          <button type="button" className="button button--primary" onClick={() => addItem(product, quantity)} disabled={!product.active || product.stock <= 0}>
            Adicionar ao carrinho
          </button>
        </div>
      </section>

      <SectionHeader title="Mais produtos" subtitle="Outros itens da mesma vitrine" />

      <section className="grid grid--products">
        {relatedProducts.map((relatedProduct) => (
          <ProductCard key={relatedProduct.id} product={relatedProduct} onAddToCart={addItem} />
        ))}
      </section>
    </div>
  )
}