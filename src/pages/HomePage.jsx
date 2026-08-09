import { Link, useNavigate } from 'react-router-dom'
import { ProductCard } from '../components/ProductCard'
import { SectionHeader } from '../components/SectionHeader'
import { useCart } from '../contexts/CartContext'
import { useProducts } from '../contexts/ProductsContext'

export function HomePage() {
  const navigate = useNavigate()
  const { products } = useProducts()
  const { addItem } = useCart()
  const featuredProducts = products.filter((product) => product.active).filter((product) => product.featured).slice(0, 4)

  return (
    <div className="page page--home">
      <section className="hero-card">
        <span className="eyebrow">NovaTech</span>
        <h1>Brinquedos eletrônicos reciclados para a nova geração</h1>
        <div className="hero-card__actions">
          <button type="button" className="button button--primary" onClick={() => navigate('/produtos')}>
            Explorar produtos
          </button>
          <Link to="/contato" className="button button--ghost button--ghost-dark">
            Falar com a loja
          </Link>
        </div>
      </section>

      <section className="mission-section" aria-labelledby="mission-title">
        <div className="mission-section__intro">
          <span className="home-banner__eyebrow">Institucional</span>
          <h2 id="mission-title">Missão, Visão e Valores</h2>
        </div>
        <div className="mission-grid">
          <article className="mission-card">
            <span>Missão</span>
            <p>Transformar resíduos eletrônicos em ferramentas de inclusão, aprendizado e diversão, criando brinquedos sustentáveis e sensoriais que conectam todas as crianças — neurotípicas e neurodivergentes — através do brincar universal.</p>
          </article>
          <article className="mission-card">
            <span>Visão</span>
            <p>Ser a marca referência em brinquedos inclusivos e economia circular na América Latina, demonstrando que a tecnologia descartada pode se transformar em um futuro mais acolhedor, consciente e acessível para a infância.</p>
          </article>
          <article className="mission-card mission-card--wide">
            <span>Valores</span>
            <p><strong>Inclusão pelo Brincar:</strong> Projetar brinquedos sob a ótica do Design Universal, garantindo que crianças autistas e neurotípicas compartilhem a mesma experiência com igualdade.</p>
          </article>
        </div>
      </section>

      <SectionHeader title="Em destaque" subtitle="Produtos prontos para adicionar ao carrinho" actionLabel="Ver todos" onAction={() => navigate('/produtos')} />

      <section className="grid grid--products">
        {featuredProducts.map((product) => (
          <ProductCard key={product.id} product={product} onAddToCart={addItem} />
        ))}
      </section>

    </div>
  )
}