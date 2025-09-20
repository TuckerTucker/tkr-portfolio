import React from 'react'
import ReactDOM from 'react-dom/client'
import AppWithServices from './AppWithServices.tsx' // Use live data version
// import App from './App.tsx' // Demo version with mock data
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppWithServices />
  </React.StrictMode>,
)
