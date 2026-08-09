import { Link } from 'react-router-dom'
import { ensureProductImage } from '../data/products'
import { formatCurrency } from '../utils/format'

export function ProductCard({ product, onAddToCart }) {
  const imageSource = ensureProductImage(product)

  return (
    <article className="product-card">
      <Link to={`/produto/${product.id}`} className="product-card__hero" aria-label={`Abrir ${product.name}`}>
        <img className="product-card__image" src={imageSource} alt={product.imageAlt || product.name} loading="lazy" />
        {!product.active || product.stock <= 0 ? <span className="product-card__chip product-card__chip--sold">Esgotado</span> : null}
      </Link>

      <div className="product-card__body">
        <span className="product-card__category">{product.categoryLabel}</span>
        <Link to={`/produto/${product.id}`} className="product-card__title-link">
          <strong className="product-card__title">{product.name}</strong>
        </Link>
        <p className="product-card__description">{product.description}</p>
        <div className="product-card__meta">
          <span className="product-card__stock">Estoque: {product.stock}</span>
          <span className="product-card__price">{formatCurrency(product.price)}</span>
        </div>
        <button type="button" className="button button--primary button--compact" onClick={() => onAddToCart(product)} disabled={!product.active || product.stock <= 0}>
          Adicionar ao carrinho
        </button>
      </div>
    </article>
  )
}