import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Container, Navbar, Nav } from 'react-bootstrap'
import { getRoles, getUsername, clearToken } from './auth'
import { useTranslation, LanguageSwitcher } from './i18n.jsx'
import { ThemeToggle } from './theme.jsx'

export default function Layout({ children }){
  const nav = useNavigate()
  const roles = getRoles()
  const username = getUsername()
  const { t } = useTranslation()

  return (
    <>
      <Navbar bg="dark" variant="dark" className="mb-4">
        <Container>
          <Navbar.Brand as={Link} to="/"><i className="bi bi-people-fill"></i> {t('brand')}</Navbar.Brand>
          <Nav className="ms-auto">
            <div className="d-flex align-items-center gap-2 me-3">
              <ThemeToggle />
              <LanguageSwitcher />
            </div>
            {username ? (
              <>
                {roles.includes('big_boss') && <Nav.Link as={Link} to="/admin/super">{t('superAdmin')}</Nav.Link>}
                <Nav.Item className="text-light align-self-center me-3">{username}</Nav.Item>
                <Nav.Link onClick={() => { clearToken(); nav('/login'); }}>{t('logout')}</Nav.Link>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login">{t('login')}</Nav.Link>
                <Nav.Link as={Link} to="/register">{t('register')}</Nav.Link>
              </>
            )}
          </Nav>
        </Container>
      </Navbar>
      <Container>
        {children}
      </Container>
    </>
  )
}
