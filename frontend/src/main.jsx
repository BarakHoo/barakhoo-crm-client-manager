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
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { I18nProvider } from './i18n.jsx'
import { ThemeProvider } from './theme.jsx'
import { isAuthenticated } from './auth'

function RequireAuth({ children }) {
  const location = useLocation()
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }
  return children
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <I18nProvider>
        <BrowserRouter basename={import.meta.env.BASE_URL}>
          <Layout>
            <Routes>
              <Route path="/" element={<RequireAuth><App /></RequireAuth>} />
              <Route path="/clients/:id" element={<RequireAuth><ClientPage /></RequireAuth>} />
              <Route path="/clients/:code" element={<RequireAuth><ClientPage /></RequireAuth>} />
              <Route path="/register" element={<Register />} />
              <Route path="/admin/pending" element={<RequireAuth><AdminPending /></RequireAuth>} />
              <Route path="/admin/super" element={<RequireAuth><SuperAdmin /></RequireAuth>} />
              <Route path="/login" element={<Login />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </I18nProvider>
    </ThemeProvider>
  </React.StrictMode>
)
