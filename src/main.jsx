import React from 'react'
import { createRoot } from 'react-dom/client'
import AppStore from './App.jsx'
import './index.css'

console.log('[main] mount: root exists?', !!document.getElementById('root'));
createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppStore />
  </React.StrictMode>
)
