import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/globals.css'  // This imports tokens automatically
// Import paper textures only where needed

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)