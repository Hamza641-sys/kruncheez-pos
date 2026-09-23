import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App'
import { AuthProvider } from './context/AuthContext'
import { POSProvider } from './context/POSContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <POSProvider>
          <App />
          <Toaster
            position="top-right"
            toastOptions={{
              style: { background: '#1e1e2e', color: '#fff', border: '1px solid #333' },
              success: { iconTheme: { primary: '#e63946', secondary: '#fff' } },
            }}
          />
        </POSProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)
