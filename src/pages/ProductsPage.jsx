import { useMemo, useState } from 'react'
import { ProductCard } from '../components/ProductCard'
import { SectionHeader } from '../components/SectionHeader'
import { useCart } from '../contexts/CartContext'
import { useProducts } from '../contexts/ProductsContext'

export function ProductsPage() {
  const { products, loading } = useProducts()
  const { addItem } = useCart()
  const [search, setSearch] = useState('')

  const filteredProducts = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    return products.filter((product) => {
      const searchableText = `${product.name} ${product.description}`.toLowerCase()
      return searchableText.includes(normalizedSearch)
    })
  }, [products, search])

  return (
    <div className="page page--products">
      <SectionHeader title="Produtos" subtitle="Somente brinquedos eletrônicos reciclados" />

      <div className="search-bar">
        <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar brinquedos, robôs, consoles..." />
      </div>

      <div className="status-strip">
        <span>{filteredProducts.length} produto(s)</span>
        <span>{loading ? 'Sincronizando...' : 'Pronto para compra'}</span>
      </div>

      <section className="grid grid--products">
        {filteredProducts.map((product) => (
          <ProductCard key={product.id} product={product} onAddToCart={addItem} />
        ))}
      </section>
    </div>
  )
}