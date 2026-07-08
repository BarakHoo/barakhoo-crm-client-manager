import React, { useState } from 'react'
import { Container, Card, Form, Button, Alert } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { useTranslation } from './i18n.jsx'

const API_BASE = import.meta.env.VITE_API_BASE || '/api'

export default function Register() {
  const [form, setForm] = useState({ username: '', email: '', password: '', requestedRole: 'sales_agent' })
  const [status, setStatus] = useState(null)
  const { t } = useTranslation()

  async function submit(e) {
    e.preventDefault()
    setStatus(null)
    const res = await fetch(`${API_BASE}/auth/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    if (!res.ok) {
      const text = await res.text()
      setStatus({ variant: 'danger', msg: text })
      return
    }
    const data = await res.json()
    setStatus({ variant: 'success', msg: t('toast.registrationSuccess') })
    setForm({ username: '', email: '', password: '', requestedRole: 'sales_agent' })
  }

  async function handleGoogleRegister() {
    window.location.href = `${API_BASE}/oauth2/authorization/google`
  }

  return (
    <Container className="py-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <Card className="shadow-lg border-0">
            <Card.Body className="p-5">
              <div className="text-center mb-4">
                <div className="mb-3">
                  <i className="bi bi-person-plus-fill" style={{ fontSize: '4rem', color: 'var(--primary)' }}></i>
                </div>
                <h2 className="fw-bold mb-2">{t('register')}</h2>
                <p className="text-secondary">{t('registerWelcome')}</p>
              </div>

              {status && <Alert variant={status.variant} className="rounded-3">{status.msg}</Alert>}

              <Form onSubmit={submit}>
                <Form.Group className="mb-3">
                  <Form.Label>{t('name')}</Form.Label>
                  <Form.Control 
                    size="lg"
                    placeholder={t('chooseUsername')}
                    value={form.username} 
                    onChange={e => setForm({ ...form, username: e.target.value })} 
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>{t('email')}</Form.Label>
                  <Form.Control 
                    size="lg"
                    type="email"
                    placeholder={t('enterEmail')}
                    value={form.email} 
                    onChange={e => setForm({ ...form, email: e.target.value })} 
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>{t('password')}</Form.Label>
                  <Form.Control 
                    size="lg"
                    type="password" 
                    placeholder={t('createPassword')}
                    value={form.password} 
                    onChange={e => setForm({ ...form, password: e.target.value })} 
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>{t('roleYouAreRequesting')}</Form.Label>
                  <Form.Select 
                    size="lg"
                    value={form.requestedRole} 
                    onChange={e => setForm({ ...form, requestedRole: e.target.value })}
                  >
                    <option value="sales_agent">{t('roles.sales_agent')}</option>
                    <option value="agent_manager">{t('roles.agent_manager')}</option>
                    <option value="big_boss">{t('roles.big_boss')}</option>
                  </Form.Select>
                </Form.Group>

                <Button type="submit" size="lg" className="w-100 mb-3">
                  <i className="bi bi-person-check me-2"></i>
                  {t('register')}
                </Button>
              </Form>

              <div className="position-relative my-4">
                <hr />
                <span className="position-absolute top-50 start-50 translate-middle px-3" 
                      style={{ background: 'var(--card-bg)', color: 'var(--text-secondary)' }}>
                  {t('orDivider')}
                </span>
              </div>

              <Button 
                variant="outline-secondary" 
                size="lg" 
                className="w-100 btn-google mb-3"
                onClick={handleGoogleRegister}
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                {t('signUpWithGoogle')}
              </Button>

              <div className="text-center mt-4">
                <span className="text-secondary">{t('haveAccount')}</span>
                <Link to="/login" className="fw-bold">{t('login')}</Link>
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>
    </Container>
  )
}
