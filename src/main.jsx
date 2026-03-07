/**
 * @file main.jsx
 * @description React DOM mount point. Renders the App inside StrictMode.
 */

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)
