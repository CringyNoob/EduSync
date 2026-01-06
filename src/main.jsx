import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'

import { CartProvider } from './context/CartContext'

import { NotificationProvider } from './context/NotificationContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <ThemeProvider>
        <CartProvider>
          <NotificationProvider>
            <App />
          </NotificationProvider>
        </CartProvider>
      </ThemeProvider>
    </AuthProvider>
  </StrictMode>,
)
