import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import { AppProvider }  from './context/AppContext.jsx'
import { OrgProvider }  from './context/OrgContext.jsx'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <AuthProvider>
      <OrgProvider>
        <AppProvider>
          <App />
        </AppProvider>
      </OrgProvider>
    </AuthProvider>
  </BrowserRouter>
)