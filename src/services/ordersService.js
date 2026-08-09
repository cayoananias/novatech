import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  where,
} from 'firebase/firestore'
import { firebaseDb, hasFirebaseConfig } from '../config/firebase'
import { getProductsSnapshot } from './productsService'
import { createId, readJson, writeJson } from '../utils/storage'

const localOrdersKey = 'novatech-orders'

function readLocalOrders() {
  return readJson(localOrdersKey, [])
}

function writeLocalOrders(orders) {
  writeJson(localOrdersKey, orders)
  return orders
}

export function subscribeAllOrders(onChange) {
  if (hasFirebaseConfig && firebaseDb) {
    const ordersQuery = query(collection(firebaseDb, 'orders'), orderBy('createdAt', 'desc'))
    return onSnapshot(ordersQuery, (snapshot) => {
      onChange(snapshot.docs.map((orderDoc) => ({ id: orderDoc.id, ...orderDoc.data() })))
    })
  }

  onChange(readLocalOrders())
  return () => undefined
}

export function subscribeUserOrders(userId, onChange) {
  if (hasFirebaseConfig && firebaseDb) {
    const ordersQuery = query(
      collection(firebaseDb, 'orders'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
    )

    return onSnapshot(ordersQuery, (snapshot) => {
      onChange(snapshot.docs.map((orderDoc) => ({ id: orderDoc.id, ...orderDoc.data() })))
    })
  }

  onChange(readLocalOrders().filter((order) => order.userId === userId))
  return () => undefined
}

export async function placeOrder({ user, items, totals, paymentMethod = 'pending', shippingAddress = {} }) {
  if (items.length === 0) {
    throw new Error('Seu carrinho está vazio.')
  }

  if (hasFirebaseConfig && firebaseDb) {
    const orderReference = doc(collection(firebaseDb, 'orders'))

    await runTransaction(firebaseDb, async (transaction) => {
      for (const item of items) {
        const productReference = doc(firebaseDb, 'products', item.id)
        const productSnapshot = await transaction.get(productReference)

        if (!productSnapshot.exists()) {
          throw new Error(`Produto indisponível: ${item.name}`)
        }

        const currentStock = Number(productSnapshot.data().stock || 0)
        if (currentStock < item.quantity) {
          throw new Error(`Estoque insuficiente para ${item.name}`)
        }

        transaction.update(productReference, {
          stock: currentStock - item.quantity,
          active: currentStock - item.quantity > 0,
          updatedAt: serverTimestamp(),
        })
      }

      transaction.set(orderReference, {
        userId: user.uid,
        userEmail: user.email || '',
        userName: user.name || '',
        products: items,
        subtotal: totals.subtotal,
        total: totals.total,
        itemCount: totals.itemCount,
        paymentMethod,
        shippingAddress,
        status: 'pending',
        createdAt: serverTimestamp(),
      })
    })

    return { id: orderReference.id }
  }

  const products = getProductsSnapshot()
  const nextProducts = products.map((product) => ({ ...product }))

  for (const item of items) {
    const product = nextProducts.find((candidate) => candidate.id === item.id)
    if (!product || product.active === false) {
      throw new Error(`Produto indisponível: ${item.name}`)
    }

    const currentStock = Number(product.stock || 0)
    if (currentStock < item.quantity) {
      throw new Error(`O estoque disponível de ${item.name} mudou. Disponível: ${currentStock} unidade(s).`)
    }

    product.stock = currentStock - item.quantity
    product.active = product.stock > 0
    product.updatedAt = Date.now()
  }

  writeJson('novatech-products', nextProducts)

  const orders = readLocalOrders()
  const order = {
    id: createId('order'),
    userId: user.uid,
    userEmail: user.email || '',
    userName: user.name || '',
    products: items,
    subtotal: totals.subtotal,
    total: totals.total,
    itemCount: totals.itemCount,
    paymentMethod,
    shippingAddress,
    status: 'pending',
    createdAt: Date.now(),
  }

  writeLocalOrders([order, ...orders])
  return order
}

export async function getUserOrders(userId) {
  if (hasFirebaseConfig && firebaseDb) {
    const ordersQuery = query(
      collection(firebaseDb, 'orders'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
    )

    const snapshot = await getDocs(ordersQuery)
    return snapshot.docs.map((orderDoc) => ({ id: orderDoc.id, ...orderDoc.data() }))
  }

  return readLocalOrders().filter((order) => order.userId === userId)
}

export function getOrdersSnapshot() {
  return readLocalOrders()
}