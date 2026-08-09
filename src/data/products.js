import { createId } from '../utils/storage'

function makeToyImageDataUrl({ title, accent, icon }) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${accent}" />
          <stop offset="100%" stop-color="#f5efe2" />
        </linearGradient>
      </defs>
      <rect width="640" height="480" rx="48" fill="url(#bg)" />
      <circle cx="520" cy="96" r="48" fill="rgba(255,255,255,0.5)" />
      <circle cx="112" cy="388" r="60" fill="rgba(255,255,255,0.38)" />
      <rect x="96" y="124" width="448" height="200" rx="36" fill="rgba(19,44,30,0.1)" />
      <rect x="124" y="152" width="392" height="144" rx="28" fill="rgba(255,255,255,0.72)" />
      <text x="320" y="238" text-anchor="middle" font-size="110">${icon}</text>
      <text x="320" y="360" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="28" fill="#132c1e" font-weight="700">${title}</text>
    </svg>
  `

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
}

const categorySlug = 'brinquedos-eletronicos-reciclados'
const categoryLabel = 'Brinquedos Eletrônicos Reciclados'

export const seedProducts = [
  {
    id: 'robo-eco-bot',
    name: 'Robô EcoBot',
    description: 'Robô interativo montado com peças reaproveitadas e luzes responsivas.',
    price: 129.9,
    stock: 14,
    imageUrl: makeToyImageDataUrl({ title: 'EcoBot', accent: '#dbe9cc', icon: '🤖' }),
    imageAlt: 'Robô EcoBot em tons verdes e bege',
    category: categorySlug,
    categoryLabel,
    active: true,
    featured: true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'console-replay',
    name: 'Console RePlay 8-bit',
    description: 'Mini console portátil com carcaça reciclada e jogos educativos clássicos.',
    price: 179.9,
    stock: 9,
    imageUrl: makeToyImageDataUrl({ title: 'RePlay', accent: '#f0dfc1', icon: '🎮' }),
    imageAlt: 'Console RePlay 8-bit reciclado',
    category: categorySlug,
    categoryLabel,
    active: true,
    featured: true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'dino-sensorial',
    name: 'Dino Sensorial',
    description: 'Dinossauro com som, textura e bateria recarregável de baixo consumo.',
    price: 89.9,
    stock: 18,
    imageUrl: makeToyImageDataUrl({ title: 'Dino', accent: '#dde7da', icon: '🦖' }),
    imageAlt: 'Dino Sensorial reciclado',
    category: categorySlug,
    categoryLabel,
    active: true,
    featured: false,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'carrinho-solar',
    name: 'Carrinho Solar Sprint',
    description: 'Carrinho movido a energia solar, com chassi leve e resistente.',
    price: 74.9,
    stock: 22,
    imageUrl: makeToyImageDataUrl({ title: 'Sprint', accent: '#f1e4bb', icon: '🚗' }),
    imageAlt: 'Carrinho solar reciclado',
    category: categorySlug,
    categoryLabel,
    active: true,
    featured: false,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'piano-recarregavel',
    name: 'Piano Recarregável JoyKeys',
    description: 'Piano infantil com teclas coloridas e energia recarregável via USB-C.',
    price: 149.9,
    stock: 7,
    imageUrl: makeToyImageDataUrl({ title: 'JoyKeys', accent: '#dfe8f0', icon: '🎹' }),
    imageAlt: 'Piano recarregável JoyKeys',
    category: categorySlug,
    categoryLabel,
    active: true,
    featured: true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'kit-circuito',
    name: 'Kit Circuito Criativo',
    description: 'Blocos eletrônicos reciclados para aprender montagem e lógica.',
    price: 159.9,
    stock: 11,
    imageUrl: makeToyImageDataUrl({ title: 'Circuito', accent: '#e5edd2', icon: '🧩' }),
    imageAlt: 'Kit de circuito criativo reciclado',
    category: categorySlug,
    categoryLabel,
    active: true,
    featured: false,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
]

export const defaultProductFilters = {
  category: categorySlug,
}

export function ensureProductImage(product) {
  if (product.imageUrl) {
    return product.imageUrl
  }

  return makeToyImageDataUrl({
    title: product.name,
    accent: '#dbe9cc',
    icon: '🧸',
  })
}

export function normalizeProduct(rawProduct) {
  return {
    id: rawProduct.id || createId('product'),
    name: rawProduct.name?.trim() || 'Novo brinquedo',
    description: rawProduct.description?.trim() || '',
    price: Number(rawProduct.price) || 0,
    stock: Math.max(0, Number(rawProduct.stock) || 0),
    imageUrl: rawProduct.imageUrl || '',
    imageAlt: rawProduct.imageAlt || rawProduct.name || 'Imagem do produto',
    category: categorySlug,
    categoryLabel,
    active: rawProduct.active ?? true,
    featured: rawProduct.featured ?? false,
    createdAt: rawProduct.createdAt || Date.now(),
    updatedAt: Date.now(),
  }
}

export { categoryLabel, categorySlug, makeToyImageDataUrl }