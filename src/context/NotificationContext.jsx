import { createContext, useContext, useEffect, useState, useRef } from 'react'
import { usePOS } from './POSContext'
import { useKitchenSound } from '../hooks/useKitchenSound'

const NotificationContext = createContext()

export function NotificationProvider({ children }) {
  const { orders }              = usePOS()
  const { playBell, playAlert } = useKitchenSound()
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount]     = useState(0)
  const prevOrdersRef   = useRef([])
  const initializedRef  = useRef(false)

  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true
      prevOrdersRef.current  = orders.map(o => o.id)
      return
    }

    const prevIds    = new Set(prevOrdersRef.current)
    const newOrders  = orders.filter(o => !prevIds.has(o.id))

    if (newOrders.length > 0) {
      // Play bell for each new order
      playBell(newOrders.length > 1 ? 3 : 2)

      // Add notifications
      const newNotifs = newOrders.map(o => ({
        id:        o.id + '_' + Date.now(),
        type:      'new_order',
        title:     `New Order #${String(o.orderNumber || o.id.slice(0,4)).padStart(4,'0')}`,
        message:   `${(o.items||[]).reduce((s,i)=>s+i.qty,0)} items — Rs. ${(o.total||0).toLocaleString()} (${o.orderType||'dine-in'})`,
        time:      new Date(),
        read:      false,
        orderId:   o.id,
        icon:      o.orderType === 'delivery' ? '🚴' : o.orderType === 'takeaway' ? '🥡' : '🍽️',
      }))

      setNotifications(prev => [...newNotifs, ...prev].slice(0, 50))
      setUnreadCount(c => c + newOrders.length)
    }

    // Alert for orders pending > 15 minutes
    const now = Date.now()
    orders.forEach(o => {
      if (o.status === 'pending' && o.createdAt?.toDate) {
        const ageMin = (now - o.createdAt.toDate().getTime()) / 60000
        if (ageMin > 15 && ageMin < 16) { // alert once around 15 min mark
          playAlert()
          addNotification({
            type: 'warning',
            title: `⚠️ Order #${String(o.orderNumber||o.id.slice(0,4)).padStart(4,'0')} is waiting!`,
            message: `Pending for ${Math.round(ageMin)} minutes`,
            icon: '⚠️',
          })
        }
      }
    })

    prevOrdersRef.current = orders.map(o => o.id)
  }, [orders])

  const addNotification = (notif) => {
    setNotifications(prev => [{
      id: Date.now().toString(),
      time: new Date(),
      read: false,
      ...notif,
    }, ...prev].slice(0, 50))
    setUnreadCount(c => c + 1)
  }

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    setUnreadCount(0)
  }

  const markRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    setUnreadCount(c => Math.max(0, c - 1))
  }

  const clearAll = () => {
    setNotifications([])
    setUnreadCount(0)
  }

  return (
    <NotificationContext.Provider value={{
      notifications, unreadCount,
      markAllRead, markRead, clearAll, addNotification,
    }}>
      {children}
    </NotificationContext.Provider>
  )
}

export const useNotifications = () => useContext(NotificationContext)
