import React, { useState } from 'react'
import { Container, Card, Form, Button, Alert } from 'react-bootstrap'
import { Link, useNavigate } from 'react-router-dom'
import { saveToken } from './auth'
import { useTranslation } from './i18n.jsx'

const API_BASE = import.meta.env.VITE_API_BASE || '/api'

export default function Login({ onLogin }){
  const [form, setForm] = useState({ username:'', password:'' })
  const [err, setErr] = useState(null)
  const navigate = useNavigate()
  const { t } = useTranslation()

  async function submit(e){
    e.preventDefault(); setErr(null)
    try {
      const res = await fetch(`${API_BASE}/auth/login`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(form) })
      if(!res.ok){ const txt = await res.text().catch(()=>null); setErr(txt || `${t('serverError')} ${res.status}`); return }
      const data = await res.json();
      saveToken(data.token);
      if(onLogin) onLogin();
      navigate('/')
    } catch (ex) {
      console.error('Login request failed', ex)
      setErr(`${t('connectionError')} ${API_BASE} ?)`)
    }
  }

  return (
    <Container className="py-5">
      <div className="row justify-content-center">
        <div className="col-md-5">
          <Card className="shadow-lg border-0">
            <Card.Body className="p-5">
              <div className="text-center mb-4">
                <div className="mb-3">
                  <i className="bi bi-person-circle" style={{ fontSize: '4rem', color: 'var(--primary)' }}></i>
                </div>
                <h2 className="fw-bold mb-2">{t('login')}</h2>
                <p className="text-secondary">{t('loginWelcome')}</p>
              </div>

              {err && <Alert variant="danger" className="rounded-3">{err}</Alert>}

              <Form onSubmit={submit}>
                <Form.Group className="mb-3">
                  <Form.Label>{t('name')}</Form.Label>
                  <Form.Control 
                    size="lg"
                    placeholder={t('enterUsername')} 
                    value={form.username} 
                    onChange={e=>setForm({...form,username:e.target.value})} 
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>{t('password')}</Form.Label>
                  <Form.Control 
                    size="lg"
                    type="password" 
                    placeholder={t('enterPassword')}
                    value={form.password} 
                    onChange={e=>setForm({...form,password:e.target.value})} 
                  />
                </Form.Group>

                <Button type="submit" size="lg" className="w-100 mb-3">
                  <i className="bi bi-box-arrow-in-right me-2"></i>
                  {t('login')}
                </Button>
              </Form>

              <div className="text-center mt-4">
                <span className="text-secondary">{t('noAccount')}</span>
                <Link to="/register" className="fw-bold">{t('register')}</Link>
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>
    </Container>
  )
}
