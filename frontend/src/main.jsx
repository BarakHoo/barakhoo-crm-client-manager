import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import ClientPage from './ClientPage'
import Register from './Register'
import AdminPending from './AdminPending'
import SuperAdmin from './SuperAdmin'
import Login from './Login'
import Layout from './Layout'
// Navbar removed from App; Layout now provides the site navigation
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import './index.css'
import './styles.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { I18nProvider } from './i18n.jsx'
import { ThemeProvider } from './theme.jsx'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <I18nProvider>
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<App />} />
              <Route path="/clients/:id" element={<ClientPage />} />
              <Route path="/clients/:code" element={<ClientPage />} />
              <Route path="/register" element={<Register />} />
              <Route path="/admin/pending" element={<AdminPending />} />
              <Route path="/admin/super" element={<SuperAdmin />} />
              <Route path="/login" element={<Login />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </I18nProvider>
    </ThemeProvider>
  </React.StrictMode>
)
