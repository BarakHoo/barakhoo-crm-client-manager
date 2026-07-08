import React, { useEffect, useState } from 'react'
import { Container, Card, Table, Button, Toast } from 'react-bootstrap'
import { useTranslation } from './i18n.jsx'

const API_BASE = import.meta.env.VITE_API_BASE || '/api'

export default function AdminPending() {
  const [pending, setPending] = useState([])
  const [actionLoading, setActionLoading] = useState(null)
  const [toast, setToast] = useState({ show: false, msg: '', variant: 'success' })
  const { t } = useTranslation()

  useEffect(() => { load() }, [])
  async function load() {
    const res = await fetch(`${API_BASE}/admin/pending`, { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('crm_token') } })
    if (res.status === 401 || res.status === 403) { setPending([]); return }
    const data = await res.json()
    setPending(data)
  }

  async function approve(id) {
    try {
      setActionLoading(id)
      const res = await fetch(`${API_BASE}/admin/approve/${id}`, { method: 'POST', headers: { 'Authorization': 'Bearer ' + localStorage.getItem('crm_token') } })
      if (res.ok) {
        const user = pending.find(u => u.id === id)
        setToast({ show: true, msg: `${user?.username || t('user')} ${t('toast.userApproved')}`, variant: 'success' })
      } else {
        let text = ''
        try { text = await res.text() } catch (e) { }
        setToast({ show: true, msg: `${t('toast.approveFailed')}: ${res.status} ${text}`, variant: 'danger' })
      }
    } finally {
      setActionLoading(null)
      load()
      setTimeout(() => setToast({ ...toast, show: false }), 3000)
    }
  }
  async function deny(id) {
    try {
      setActionLoading(id)
      const res = await fetch(`${API_BASE}/admin/deny/${id}`, { method: 'POST', headers: { 'Authorization': 'Bearer ' + localStorage.getItem('crm_token') } })
      if (res.ok) {
        const user = pending.find(u => u.id === id)
        setToast({ show: true, msg: `${user?.username || t('user')} ${t('toast.userDenied')}`, variant: 'warning' })
      } else {
        let text = ''
        try { text = await res.text() } catch (e) { }
        setToast({ show: true, msg: `${t('toast.denyFailed')}: ${res.status} ${text}`, variant: 'danger' })
      }
    } finally {
      setActionLoading(null)
      load()
      setTimeout(() => setToast({ ...toast, show: false }), 3000)
    }
  }

  return (
    <Container className="py-4">
      <Card className="shadow-sm">
        <Card.Body>
          <Card.Title>{t('pending')} {t('registrations')}</Card.Title>
          <div style={{ position: 'relative' }}>
            <Toast show={toast.show} bg={toast.variant} onClose={() => setToast({ ...toast, show: false })} style={{ position: 'absolute', right: 10, top: -50 }}>
              <Toast.Body className="text-white">{toast.msg}</Toast.Body>
            </Toast>
            <Table>
            <thead><tr><th>{t('name')}</th><th>{t('email')}</th><th>{t('requestedRole')}</th><th>{t('actions')}</th></tr></thead>
            <tbody>
              {pending.map(u => (
                <tr key={u.id}>
                  <td>{u.username}</td>
                  <td>{u.email}</td>
                  <td>{u.requestedRole}</td>
                  <td>
                    <Button size="sm" variant="success" className="me-2" onClick={() => approve(u.id)} disabled={actionLoading === u.id}>{t('approve')}</Button>
                    <Button size="sm" variant="danger" onClick={() => deny(u.id)} disabled={actionLoading === u.id}>{t('deny')}</Button>
                  </td>
                </tr>
              ))}
            </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>
    </Container>
  )
}
