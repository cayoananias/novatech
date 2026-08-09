import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { hasFirebaseConfig } from '../config/firebase'
import {
  createProduct as createProductService,
  deleteProduct as deleteProductService,
  getProductById,
  getProductsSnapshot,
  subscribeProducts,
  updateProduct as updateProductService,
} from '../services/productsService'

const ProductsContext = createContext(null)

export function ProductsProvider({ children }) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = subscribeProducts((nextProducts) => {
      setProducts(nextProducts)
      setLoading(false)
    })

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe()
      }
    }
  }, [])

  const actions = useMemo(
    () => ({
      products,
      loading,
      hasFirebaseConfig,
      getById: (productId) => products.find((product) => product.id === productId) || getProductById(productId),
      refreshLocalSnapshot: () => getProductsSnapshot(),
      createProduct: async (payload) => {
        const createdProduct = await createProductService(payload)
        if (!hasFirebaseConfig) {
          setProducts((currentProducts) => [createdProduct, ...currentProducts])
        }
        return createdProduct
      },
      updateProduct: async (productId, payload) => {
        const updatedProduct = await updateProductService(productId, payload)
        if (!hasFirebaseConfig) {
          setProducts((currentProducts) => currentProducts.map((product) => (product.id === productId ? { ...product, ...updatedProduct } : product)))
        }
        return updatedProduct
      },
      deleteProduct: async (productId) => {
        await deleteProductService(productId)
        if (!hasFirebaseConfig) {
          setProducts((currentProducts) => currentProducts.filter((product) => product.id !== productId))
        }
      },
    }),
    [products, loading],
  )

  return <ProductsContext.Provider value={actions}>{children}</ProductsContext.Provider>
}

export function useProducts() {
  const context = useContext(ProductsContext)
  if (!context) {
    throw new Error('useProducts deve ser usado dentro de ProductsProvider')
  }

  return context
}