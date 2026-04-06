import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthContextProvider } from './context/AuthContext.jsx'
import { CartProvider } from './context/CartContext.jsx'

import { HelmetProvider } from 'react-helmet-async'

const rootElement = document.getElementById('root');
const app = (
  <StrictMode>
    <AuthContextProvider>
      <CartProvider>
        <HelmetProvider>
          <App />
        </HelmetProvider>
      </CartProvider>
    </AuthContextProvider>
  </StrictMode>
);

// Always use createRoot to prevent Error #418 (Hydration mismatch) 
// caused by Tailwind CDN or external scripts modifying the DOM before React handles it.
const root = createRoot(rootElement);
root.render(app);
