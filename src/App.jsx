import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import POS from './pages/POS'
import Orders from './pages/Orders'
import Tables from './pages/Tables'
import Kitchen from './pages/Kitchen'
import Menu from './pages/Menu'
import Inventory from './pages/Inventory'
import Customers from './pages/Customers'
import Expenses from './pages/Expenses'
import Reports from './pages/Reports'
import Employees from './pages/Employees'
import Settings from './pages/Settings'

function PrivateRoute({ children }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" replace />
}

export default function App() {
  const { user } = useAuth()

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="pos" element={<POS />} />
        <Route path="orders" element={<Orders />} />
        <Route path="tables" element={<Tables />} />
        <Route path="kitchen" element={<Kitchen />} />
        <Route path="menu" element={<Menu />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="customers" element={<Customers />} />
        <Route path="expenses" element={<Expenses />} />
        <Route path="reports" element={<Reports />} />
        <Route path="employees" element={<Employees />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
