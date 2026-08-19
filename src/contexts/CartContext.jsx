import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useProducts } from './ProductsContext'
import { formatCurrency } from '../utils/format'
import { readJson, writeJson } from '../utils/storage'

const CartContext = createContext(null)
const cartStorageKey = 'novatech-cart'

function normalizeId(id) {
  return id == null ? '' : String(id)
}

function matchesProductId(product, productId) {
  const normalizedProductId = normalizeId(productId)
  return normalizeId(product.id) === normalizedProductId || normalizeId(product.legacyId) === normalizedProductId
}

function clampQuantity(quantity, stock) {
  const numericQuantity = Number(quantity)
  const numericStock = Number(stock)

  if (!Number.isFinite(numericQuantity) || !Number.isFinite(numericStock) || numericStock <= 0 || numericQuantity <= 0) {
    return 0
  }

  return Math.min(Math.floor(numericQuantity), numericStock)
}

function normalizeStoredItems(items) {
  if (!Array.isArray(items)) {
    return []
  }

  return items
    .map((item) => ({
      ...item,
      price: Number(item.price) || 0,
      stock: Number(item.stock) || 0,
      quantity: clampQuantity(item.quantity, item.stock),
    }))
    .filter((item) => item.id && item.quantity > 0)
}

function persistCartItems(nextItems) {
  writeJson(cartStorageKey, nextItems)
  return nextItems
}

function CartProvider({ children }) {

}

function normalizeStoredItems(items) {
  if (!Array.isArray(items)) {
    return []
  }

  return items
    .map((item) => ({
      ...item,
      id: normalizeId(item.id),
      price: Number(item.price) || 0,
      stock: Number(item.stock) || 0,
      quantity: clampQuantity(item.quantity, item.stock),
    }))
    .filter((item) => item.id && item.quantity > 0)
}

function persistCartItems(nextItems) {
  writeJson(cartStorageKey, nextItems)
  return nextItems
}

export function CartProvider({ children }) {
  const { products, loading: productsLoading } = useProducts()
  const [items, setItems] = useState(() => normalizeStoredItems(readJson(cartStorageKey, [])))

  useEffect(() => {
    persistCartItems(items)
  }, [items])

  useEffect(() => {
    const handleStorage = (event) => {
      if (event.key === cartStorageKey) {
        setItems(normalizeStoredItems(readJson(cartStorageKey, [])))
      }
    }

    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  useEffect(() => {
    if (productsLoading || products.length === 0) {
      return
    }

    setItems((currentItems) => {
      const productsById = new Map(products.map((product) => [product.id, product]))
      const nextItems = currentItems
        .map((item) => {
          const product = productsById.get(item.id)
      const productsById = new Map()
      products.forEach((product) => {
        productsById.set(normalizeId(product.id), product)
        if (product.legacyId) {
          productsById.set(normalizeId(product.legacyId), product)
        }
      })
      const nextItems = currentItems
        .map((item) => {
          const product = productsById.get(normalizeId(item.id))
          if (!product || product.active === false) {
            return null
          }

          const quantity = clampQuantity(item.quantity, product.stock)
          if (quantity <= 0) {
            return null
          }

          return {
            ...item,
            name: product.name,
            description: product.description,
            imageUrl: product.imageUrl,
            imageAlt: product.imageAlt,
            price: Number(product.price) || 0,
            stock: Number(product.stock) || 0,
            active: product.active,
            quantity,
          }
        })
        .filter(Boolean)

      const changed = JSON.stringify(nextItems) !== JSON.stringify(currentItems)
      return changed ? persistCartItems(nextItems) : currentItems
    })
  }, [products, productsLoading])

  const addItem = useCallback((product, quantity = 1) => {
    if (!product?.stock || product.stock <= 0 || product.active === false) {
      return
    }

    setItems((currentItems) => {
      const productId = normalizeId(product.id)
      const existingItem = currentItems.find((item) => normalizeId(item.id) === productId)
      const nextQuantity = clampQuantity((existingItem?.quantity || 0) + quantity, product.stock)

      if (nextQuantity <= 0) {
        return currentItems
      }

      const nextItems = existingItem
        ? currentItems.map((item) =>
            item.id === product.id
            normalizeId(item.id) === productId
              ? {
                  ...item,
                  name: product.name,
                  description: product.description,
                  imageUrl: product.imageUrl,
                  imageAlt: product.imageAlt,
                  price: Number(product.price) || 0,
                  stock: Number(product.stock) || 0,
                  active: product.active,
                  quantity: nextQuantity,
                }
              : item,
          )
        : [
            ...currentItems,
            {
              id: product.id,
              name: product.name,
              description: product.description,
              imageUrl: product.imageUrl,
              imageAlt: product.imageAlt,
              price: Number(product.price) || 0,
              stock: Number(product.stock) || 0,
              quantity: clampQuantity(quantity, product.stock),
              active: product.active,
            },
          ]

      return persistCartItems(nextItems)
    })
  }, [])

  const updateQuantity = useCallback((productId, quantity) => {
    setItems((currentItems) => {
      const normalizedProductId = normalizeId(productId)
      const nextItems = currentItems
        .map((item) =>
          normalizeId(item.id) === normalizedProductId
            ? {
                ...item,
                quantity: clampQuantity(quantity, item.stock),
              }
            : item,
        )
        .filter((item) => item.quantity > 0)

      return persistCartItems(nextItems)
    })
  }, [])

  const removeItem = useCallback((productId) => {
    setItems((currentItems) => persistCartItems(currentItems.filter((item) => item.id !== productId)))
  }, [])


  const removeItem = useCallback((productId) => {
    const normalizedProductId = normalizeId(productId)
    setItems((currentItems) => persistCartItems(currentItems.filter((item) => normalizeId(item.id) !== normalizedProductId)))
  }, [])

  const clearCart = useCallback(() => {
    setItems(persistCartItems([]))
  }, [])

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
    [addItem, cartSummary, clearCart, items, removeItem, updateQuantity],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart deve ser usado dentro de CartProvider')
  }

  return context
}

export { CartProvider, useCart }
