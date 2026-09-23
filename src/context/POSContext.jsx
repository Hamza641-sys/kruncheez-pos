import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { subscribeCollection, getTables, getMenuItems } from '../firebase/firestore'
import { orderBy } from '../firebase/firestore'

const POSContext = createContext()

export function POSProvider({ children }) {
  const [menuItems, setMenuItems]       = useState([])
  const [menuCategories, setMenuCategories] = useState([])
  const [tables, setTables]             = useState([])
  const [orders, setOrders]             = useState([])
  const [cart, setCart]                 = useState([])
  const [selectedTable, setSelectedTable] = useState(null)
  const [orderType, setOrderType]       = useState('dine-in') // dine-in | takeaway | delivery
  const [loadingData, setLoadingData]   = useState(true)

  // Live listeners
  useEffect(() => {
    const unsubCat  = subscribeCollection('menuCategories', data => {
      setMenuCategories([...data].sort((a, b) => a.order - b.order))
    }, orderBy('order'))

    const unsubItems = subscribeCollection('menuItems', setMenuItems, orderBy('categoryId'))

    const unsubTables = subscribeCollection('tables', data => {
      setTables([...data].sort((a, b) => a.number - b.number))
    }, orderBy('number'))

    const unsubOrders = subscribeCollection('orders', data => {
      setOrders([...data].sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds))
      setLoadingData(false)
    }, orderBy('createdAt', 'desc'))

    return () => { unsubCat(); unsubItems(); unsubTables(); unsubOrders() }
  }, [])

  // Cart operations
  const addToCart = useCallback((item, qty = 1) => {
    setCart(prev => {
      const existing = prev.find(c => c.itemId === item.id)
      if (existing) {
        return prev.map(c => c.itemId === item.id ? { ...c, qty: c.qty + qty } : c)
      }
      return [...prev, { itemId: item.id, name: item.name, price: item.price, qty, note: '' }]
    })
  }, [])

  const removeFromCart = useCallback((itemId) => {
    setCart(prev => prev.filter(c => c.itemId !== itemId))
  }, [])

  const updateCartQty = useCallback((itemId, qty) => {
    if (qty <= 0) { removeFromCart(itemId); return }
    setCart(prev => prev.map(c => c.itemId === itemId ? { ...c, qty } : c))
  }, [removeFromCart])

  const updateCartNote = useCallback((itemId, note) => {
    setCart(prev => prev.map(c => c.itemId === itemId ? { ...c, note } : c))
  }, [])

  const clearCart = useCallback(() => {
    setCart([])
    setSelectedTable(null)
    setOrderType('dine-in')
  }, [])

  const cartTotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0)
  const cartCount = cart.reduce((sum, i) => sum + i.qty, 0)

  // Stats
  const todayOrders  = orders.filter(o => {
    const d = o.createdAt?.toDate?.()
    if (!d) return false
    const today = new Date()
    return d.toDateString() === today.toDateString()
  })
  const todaySales   = todayOrders.filter(o => o.paymentStatus === 'paid')
    .reduce((s, o) => s + (o.total || 0), 0)
  const pendingCount = orders.filter(o => ['pending','preparing'].includes(o.status)).length
  const occupiedTables = tables.filter(t => t.status === 'occupied').length

  return (
    <POSContext.Provider value={{
      menuItems, menuCategories, tables, orders,
      cart, addToCart, removeFromCart, updateCartQty, updateCartNote, clearCart,
      cartTotal, cartCount,
      selectedTable, setSelectedTable,
      orderType, setOrderType,
      loadingData,
      // stats
      todayOrders, todaySales, pendingCount, occupiedTables,
      totalTables: tables.length,
    }}>
      {children}
    </POSContext.Provider>
  )
}

export const usePOS = () => useContext(POSContext)
