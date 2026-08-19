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

function normalizeId(id) {
  return id == null ? '' : String(id)
}

function matchesProductId(product, productId) {
  const normalizedProductId = normalizeId(productId)
  return normalizeId(product.id) === normalizedProductId || normalizeId(product.legacyId) === normalizedProductId
}

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
      getById: (productId) => products.find((product) => matchesProductId(product, productId)) || getProductById(productId),
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
          setProducts((currentProducts) =>
            currentProducts.map((product) => (matchesProductId(product, productId) ? { ...product, ...updatedProduct } : product)),
          )
        }
        return updatedProduct
      },
      deleteProduct: async (productId) => {
        const normalizedProductId = normalizeId(productId)
        const previousProducts = products

        setProducts((currentProducts) => currentProducts.filter((product) => normalizeId(product.id) !== normalizedProductId))

        try {
          await deleteProductService(normalizedProductId)
        } catch (error) {
          setProducts(previousProducts)
          throw error
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
