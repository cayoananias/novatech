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

function normalizeId(id) {
  return id == null ? '' : String(id)
}

function normalizeProductRecord(product) {
  const legacyId = normalizeId(product.legacyId || product.sourceId || '')
  return {
    ...product,
    id: normalizeId(product.id),
    legacyId: legacyId || undefined,
    price: Number(product.price) || 0,
    stock: Math.max(0, Number(product.stock) || 0),
    active: product.active !== false,
    featured: product.featured === true || product.featured === 'true' || product.featured === 1 || product.featured === '1',
  }
}

function readLocalProducts() {
  const storedProducts = readJson(localProductsKey, null)
  const sourceProducts = Array.isArray(storedProducts) && storedProducts.length > 0 ? storedProducts : seedProducts
  return sourceProducts.map(normalizeProductRecord)
}

function writeLocalProducts(products) {
  writeJson(localProductsKey, products)
  return products
}

export function subscribeProducts(onChange) {
  if (hasFirebaseConfig && firebaseDb) {
    const productsQuery = query(collection(firebaseDb, 'products'), orderBy('createdAt', 'desc'))
    return onSnapshot(productsQuery, (snapshot) => {
      onChange(
        snapshot.docs.map((productDoc) =>
          normalizeProductRecord({
            ...productDoc.data(),
            id: productDoc.id,
            legacyId: productDoc.data().id,
          }),
        ),
      )
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

function readFileAsDataUrl(imageFile) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error('Não foi possível armazenar a imagem localmente.'))
    reader.readAsDataURL(imageFile)
  })
}

async function uploadProductImage(imageFile) {
  if (!imageFile) {
    return ''
  }

  if (!firebaseStorage || !hasFirebaseConfig) {
    return readFileAsDataUrl(imageFile)
  }

  const safeName = imageFile.name.replace(/[^a-z0-9.-]/gi, '-').toLowerCase()
  const storagePath = `products/${createId('image')}-${safeName}`
  const imageReference = ref(firebaseStorage, storagePath)
  await uploadBytes(imageReference, imageFile, { contentType: imageFile.type })
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
    const firestorePayload = { ...payload }
    delete firestorePayload.id
    const createdRef = await addDoc(collection(firebaseDb, 'products'), {
      ...firestorePayload,
      createdAt: serverTimestamp(),
    })

    return normalizeProductRecord({ ...firestorePayload, id: createdRef.id })
  }

  const products = readLocalProducts()
  const nextProducts = [{ ...payload, id: payload.id || createId('product') }, ...products]
  writeLocalProducts(nextProducts)
  return normalizeProductRecord(nextProducts[0])
}

export async function updateProduct(productId, rawChanges) {
  const normalizedProductId = normalizeId(productId)
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
    const productReference = doc(firebaseDb, 'products', normalizedProductId)
    await updateDoc(productReference, changes)
    return normalizeProductRecord({ id: normalizedProductId, ...changes })
  }

  const nextProducts = readLocalProducts().map((product) => (normalizeId(product.id) === normalizedProductId ? { ...product, ...changes } : product))
  writeLocalProducts(nextProducts)
  return normalizeProductRecord(nextProducts.find((product) => normalizeId(product.id) === normalizedProductId))
}

export async function deleteProduct(productId) {
  const normalizedProductId = normalizeId(productId)
  if (hasFirebaseConfig && firebaseDb) {
    await deleteDoc(doc(firebaseDb, 'products', normalizedProductId))
    return normalizedProductId
  }

  const nextProducts = readLocalProducts().filter((product) => normalizeId(product.id) !== normalizedProductId)
  writeLocalProducts(nextProducts)
  return normalizedProductId
}

export function getProductById(productId) {
  const normalizedProductId = normalizeId(productId)
  const product = readLocalProducts().find(
    (candidate) => normalizeId(candidate.id) === normalizedProductId || normalizeId(candidate.legacyId) === normalizedProductId,
  )
  return product ? normalizeProductRecord(product) : undefined
}
