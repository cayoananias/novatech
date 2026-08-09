import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './app.css'
import { AuthProvider } from './contexts/AuthContext'
import { CartProvider } from './contexts/CartContext'
import { ProductsProvider } from './contexts/ProductsContext'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <ProductsProvider>
        <CartProvider>
          <App />
        </CartProvider>
      </ProductsProvider>
    </AuthProvider>
  </React.StrictMode>,
)