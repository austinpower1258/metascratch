import React from 'react'
import ReactDOM from 'react-dom/client'
import Home from './App'
import './index.css'
import 'uno.css'
import "@unocss/reset/tailwind.css"

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Home />
  </React.StrictMode>
)
