import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import './Login.css'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) { toast.error('Fill all fields'); return }
    setLoading(true)
    try {
      await login(form.email, form.password)
      toast.success('Welcome back!')
      navigate('/')
    } catch (err) {
      toast.error('Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      {/* Left brand panel */}
      <div className="login-brand">
        <div className="login-brand-logo">🍔</div>
        <h1 className="login-brand-name">THE KRUNCHEEZ</h1>
        <p className="login-brand-tag">FAST • FRESH • TASTY</p>
        <p className="login-brand-desc">
          Professional Point of Sale System.<br />
          Manage orders, tables, kitchen &<br />
          reports — all in one place.
        </p>
        <div className="login-brand-slogan">CRUNCH IN EVERY BITE</div>
      </div>

      {/* Right form panel */}
      <div className="login-form-panel">
        <div className="login-box fade-in">
          <h2 className="login-title">Welcome Back</h2>
          <p className="login-subtitle">Sign in to your POS account</p>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="login-field">
              <label>Email Address</label>
              <input
                type="email"
                placeholder="admin@kruncheez.com"
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                autoComplete="email"
              />
            </div>
            <div className="login-field">
              <label>Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                autoComplete="current-password"
              />
            </div>
            <button className="btn-primary login-btn" type="submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="login-footer">The Kruncheez POS v1.0 © 2026</p>
        </div>
      </div>
    </div>
  )
}
