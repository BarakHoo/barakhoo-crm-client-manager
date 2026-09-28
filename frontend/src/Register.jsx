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
