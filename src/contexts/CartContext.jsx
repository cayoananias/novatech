import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { formatCurrency } from '../utils/format'
import { readJson, writeJson } from '../utils/storage'

const CartContext = createContext(null)
const cartStorageKey = 'novatech-cart'

function clampQuantity(quantity, stock) {
  if (!stock || stock <= 0) {
    return 0
  }

  return Math.min(Math.max(quantity, 1), stock)
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => readJson(cartStorageKey, []))

  useEffect(() => {
    writeJson(cartStorageKey, items)
  }, [items])

  const addItem = (product, quantity = 1) => {
    if (!product?.stock || product.stock <= 0) {
      return
    }

    setItems((currentItems) => {
      const existingItem = currentItems.find((item) => item.id === product.id)
      const nextQuantity = clampQuantity((existingItem?.quantity || 0) + quantity, product.stock)

      if (nextQuantity <= 0) {
        return currentItems
      }

      if (existingItem) {
        return currentItems.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity: nextQuantity,
              }
            : item,
        )
      }

      return [
        ...currentItems,
        {
          id: product.id,
          name: product.name,
          description: product.description,
          imageUrl: product.imageUrl,
          imageAlt: product.imageAlt,
          price: Number(product.price),
          stock: product.stock,
          quantity: clampQuantity(quantity, product.stock),
          active: product.active,
        },
      ]
    })
  }

  const updateQuantity = (productId, quantity) => {
    setItems((currentItems) =>
      currentItems
        .map((item) =>
          item.id === productId
            ? {
                ...item,
                quantity: clampQuantity(quantity, item.stock),
              }
            : item,
        )
        .filter((item) => item.quantity > 0),
    )
  }

  const removeItem = (productId) => {
    setItems((currentItems) => currentItems.filter((item) => item.id !== productId))
  }

  const clearCart = () => setItems([])

  const itemCount = useMemo(() => items.reduce((total, item) => total + item.quantity, 0), [items])
  const subtotal = useMemo(() => items.reduce((total, item) => total + item.quantity * item.price, 0), [items])
  const total = subtotal

  const cartSummary = useMemo(
    () => ({
      subtotal,
      total,
      itemCount,
      subtotalLabel: formatCurrency(subtotal),
      totalLabel: formatCurrency(total),
    }),
    [itemCount, subtotal, total],
  )

  const value = useMemo(
    () => ({
      items,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
      ...cartSummary,
    }),
    [cartSummary, items],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart deve ser usado dentro de CartProvider')
  }

  return context
}