import {
  collection, doc, addDoc, setDoc, getDoc, getDocs,
  updateDoc, deleteDoc, query, where, orderBy, limit,
  onSnapshot, serverTimestamp, increment, writeBatch,
  Timestamp
} from 'firebase/firestore'
import { db } from './config'

// ── Generic helpers ─────────────────────────────────────────

export const addDocument = (col, data) =>
  addDoc(collection(db, col), { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() })

export const setDocument = (col, id, data) =>
  setDoc(doc(db, col, id), { ...data, updatedAt: serverTimestamp() }, { merge: true })

export const updateDocument = (col, id, data) =>
  updateDoc(doc(db, col, id), { ...data, updatedAt: serverTimestamp() })

export const deleteDocument = (col, id) =>
  deleteDoc(doc(db, col, id))

export const getDocument = async (col, id) => {
  const snap = await getDoc(doc(db, col, id))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

export const getCollection = async (col, ...constraints) => {
  const snap = await getDocs(query(collection(db, col), ...constraints))
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export const subscribeCollection = (col, callback, ...constraints) =>
  onSnapshot(query(collection(db, col), ...constraints), snap =>
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  )

export const subscribeDocument = (col, id, callback) =>
  onSnapshot(doc(db, col, id), snap =>
    snap.exists() ? callback({ id: snap.id, ...snap.data() }) : callback(null)
  )

// ── Orders ──────────────────────────────────────────────────

export const createOrder = async (orderData) => {
  const orderRef = await addDocument('orders', {
    ...orderData,
    status: 'pending',        // pending | preparing | ready | served | paid | cancelled
    paymentStatus: 'unpaid',  // unpaid | paid | refunded
    kitchenStatus: 'queued',  // queued | preparing | ready
  })
  // Update table status
  if (orderData.tableId) {
    await updateDocument('tables', orderData.tableId, {
      status: 'occupied',
      currentOrderId: orderRef.id
    })
  }
  return orderRef
}

export const updateOrderStatus = (orderId, status) =>
  updateDocument('orders', orderId, { status })

export const updateKitchenStatus = (orderId, kitchenStatus) =>
  updateDocument('orders', orderId, { kitchenStatus })

export const completePayment = async (orderId, paymentData) => {
  const order = await getDocument('orders', orderId)
  const batch = writeBatch(db)

  // Mark order paid
  batch.update(doc(db, 'orders', orderId), {
    status: 'paid',
    paymentStatus: 'paid',
    paymentMethod: paymentData.method,
    amountPaid: paymentData.amountPaid,
    change: paymentData.change,
    paidAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

  // Free up table
  if (order?.tableId) {
    batch.update(doc(db, 'tables', order.tableId), {
      status: 'available',
      currentOrderId: null,
      updatedAt: serverTimestamp(),
    })
  }

  // Update daily sales summary
  const today = new Date().toISOString().split('T')[0]
  const salesRef = doc(db, 'salesSummary', today)
  batch.set(salesRef, {
    date: today,
    totalSales: increment(order?.total || 0),
    totalOrders: increment(1),
    updatedAt: serverTimestamp(),
  }, { merge: true })

  await batch.commit()
}

// ── Menu ────────────────────────────────────────────────────

export const getMenuItems = (callback) =>
  subscribeCollection('menuItems', callback, where('available', '==', true), orderBy('name'))

export const getAllMenuItems = (callback) =>
  subscribeCollection('menuItems', callback, orderBy('categoryId'))

export const toggleItemAvailability = (itemId, available) =>
  updateDocument('menuItems', itemId, { available })

// ── Tables ──────────────────────────────────────────────────

export const getTables = (callback) =>
  subscribeCollection('tables', callback, orderBy('number'))

export const updateTableStatus = (tableId, status) =>
  updateDocument('tables', tableId, { status })

// ── Customers ───────────────────────────────────────────────

export const upsertCustomer = async (phone, data) => {
  const existing = await getCollection('customers', where('phone', '==', phone))
  if (existing.length > 0) {
    await updateDocument('customers', existing[0].id, {
      ...data,
      totalOrders: increment(1),
      totalSpent: increment(data.orderTotal || 0),
    })
    return existing[0].id
  } else {
    const ref = await addDocument('customers', {
      ...data,
      totalOrders: 1,
      totalSpent: data.orderTotal || 0,
      loyaltyPoints: 0,
    })
    return ref.id
  }
}

// ── Inventory ───────────────────────────────────────────────

export const getLowStockItems = () =>
  getCollection('inventory', where('quantity', '<=', 10), orderBy('quantity'))

// ── Expenses ────────────────────────────────────────────────

export const addExpense = (data) =>
  addDocument('expenses', data)

// ── Reports ─────────────────────────────────────────────────

export const getDailySales = (date) =>
  getDocument('salesSummary', date)

export const getOrdersByDateRange = (startDate, endDate) =>
  getCollection('orders',
    where('createdAt', '>=', Timestamp.fromDate(startDate)),
    where('createdAt', '<=', Timestamp.fromDate(endDate)),
    where('paymentStatus', '==', 'paid'),
    orderBy('createdAt', 'desc')
  )

// ── Seed ────────────────────────────────────────────────────

export const seedDatabase = async (categories, items, tables) => {
  const batch = writeBatch(db)

  categories.forEach(cat => {
    batch.set(doc(db, 'menuCategories', cat.id), { ...cat, createdAt: serverTimestamp() })
  })

  await batch.commit()

  // Items in batches of 400
  for (let i = 0; i < items.length; i += 400) {
    const chunk = items.slice(i, i + 400)
    const b = writeBatch(db)
    chunk.forEach(item => {
      const ref = doc(collection(db, 'menuItems'))
      b.set(ref, { ...item, createdAt: serverTimestamp(), updatedAt: serverTimestamp() })
    })
    await b.commit()
  }

  // Tables
  const tb = writeBatch(db)
  tables.forEach((table, idx) => {
    tb.set(doc(db, 'tables', `table_${idx + 1}`), { ...table, createdAt: serverTimestamp() })
  })
  await tb.commit()
}

export { where, orderBy, limit, serverTimestamp, Timestamp }
