import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore'
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { firebaseDb, firebaseStorage, hasFirebaseConfig } from '../config/firebase'
import { seedProducts, normalizeProduct } from '../data/products'
import { createId, readJson, writeJson } from '../utils/storage'

const localProductsKey = 'novatech-products'

function readLocalProducts() {
  const storedProducts = readJson(localProductsKey, null)
  return Array.isArray(storedProducts) && storedProducts.length > 0 ? storedProducts : seedProducts
}

function writeLocalProducts(products) {
  writeJson(localProductsKey, products)
  return products
}

export function subscribeProducts(onChange) {
  if (hasFirebaseConfig && firebaseDb) {
    const productsQuery = query(collection(firebaseDb, 'products'), orderBy('createdAt', 'desc'))
    return onSnapshot(productsQuery, (snapshot) => {
      onChange(snapshot.docs.map((productDoc) => ({ id: productDoc.id, ...productDoc.data() })))
    })
  }

  const syncLocalProducts = () => onChange(readLocalProducts())
  syncLocalProducts()

  const handleStorage = (event) => {
    if (event.key === localProductsKey) {
      syncLocalProducts()
    }
  }

  window.addEventListener('storage', handleStorage)
  return () => window.removeEventListener('storage', handleStorage)
}

export function getProductsSnapshot() {
  return readLocalProducts()
}

async function uploadProductImage(imageFile) {
  if (!firebaseStorage || !imageFile) {
    return ''
  }

  const storagePath = `products/${createId('image')}-${imageFile.name}`
  const imageReference = ref(firebaseStorage, storagePath)
  await uploadBytes(imageReference, imageFile)
  return getDownloadURL(imageReference)
}

export async function createProduct(rawProduct) {
  const productData = normalizeProduct(rawProduct)
  const imageUrl = rawProduct.imageFile ? await uploadProductImage(rawProduct.imageFile) : rawProduct.imageUrl || productData.imageUrl
  const payload = {
    ...productData,
    imageUrl,
    updatedAt: Date.now(),
  }

  if (hasFirebaseConfig && firebaseDb) {
    const createdRef = await addDoc(collection(firebaseDb, 'products'), {
      ...payload,
      createdAt: serverTimestamp(),
    })

    return { ...payload, id: createdRef.id }
  }

  const products = readLocalProducts()
  const nextProducts = [{ ...payload, id: payload.id || createId('product') }, ...products]
  writeLocalProducts(nextProducts)
  return nextProducts[0]
}

export async function updateProduct(productId, rawChanges) {
  const changes = { ...rawChanges }
  delete changes.id

  if (changes.imageFile) {
    changes.imageUrl = await uploadProductImage(changes.imageFile)
  }
  delete changes.imageFile

  if (changes.price !== undefined) {
    changes.price = Number(changes.price)
  }
  if (changes.stock !== undefined) {
    changes.stock = Math.max(0, Number(changes.stock))
  }

  changes.updatedAt = Date.now()

  if (hasFirebaseConfig && firebaseDb) {
    const productReference = doc(firebaseDb, 'products', productId)
    await updateDoc(productReference, changes)
    return { id: productId, ...changes }
  }

  const nextProducts = readLocalProducts().map((product) => (product.id === productId ? { ...product, ...changes } : product))
  writeLocalProducts(nextProducts)
  return nextProducts.find((product) => product.id === productId)
}

export async function deleteProduct(productId) {
  if (hasFirebaseConfig && firebaseDb) {
    await deleteDoc(doc(firebaseDb, 'products', productId))
    return productId
  }

  const nextProducts = readLocalProducts().filter((product) => product.id !== productId)
  writeLocalProducts(nextProducts)
  return productId
}

export function getProductById(productId) {
  return readLocalProducts().find((product) => product.id === productId)
}