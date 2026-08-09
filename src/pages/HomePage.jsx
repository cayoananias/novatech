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
        <p>Uma loja moderna, pensada primeiro para smartphones, com produtos reaproveitados, estoque em tempo real e carrinho funcional.</p>

        <div className="hero-card__actions">
          <button type="button" className="button button--primary" onClick={() => navigate('/produtos')}>
            Explorar produtos
          </button>
          <Link to="/contato" className="button button--ghost button--ghost-dark">
            Falar com a loja
          </Link>
        </div>
      </section>

      <section className="home-banner">
        <div>
          <span className="home-banner__eyebrow">Categoria única</span>
          <strong>Brinquedos Eletrônicos Reciclados</strong>
        </div>
        <p>Todos os itens da loja entram nessa única categoria para simplificar a navegação mobile.</p>
      </section>

      <SectionHeader title="Em destaque" subtitle="Produtos prontos para adicionar ao carrinho" actionLabel="Ver todos" onAction={() => navigate('/produtos')} />

      <section className="grid grid--products">
        {featuredProducts.map((product) => (
          <ProductCard key={product.id} product={product} onAddToCart={addItem} />
        ))}
      </section>

      {/* New institutional section */}
      <section className="mission-section">
        <h2>Missão</h2>
        <p>Transformar resíduos eletrônicos em ferramentas de inclusão, aprendizado e diversão, criando brinquedos sustentáveis e sensoriais que conectam todas as crianças — neurotípicas e neurodivergentes — através do brincar universal.</p>
        <h2>Visão</h2>
        <p>Ser a marca referência em brinquedos inclusivos e economia circular na América Latina, demonstrando que a tecnologia descartada pode se transformar em um futuro mais acolhedor, consciente e acessível para a infância.</p>
        <h2>Valores</h2>
        <p><strong>Inclusão pelo Brincar:</strong> Projetar brinquedos sob a ótica do Design Universal, garantindo que crianças autistas e neurotípicas compartilhem a mesma experiência com igualdade.</p>
      </section>
    </div>
  )
}