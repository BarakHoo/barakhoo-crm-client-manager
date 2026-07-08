import React, { useEffect, useState } from 'react'
import { Container, Card, Table, Button, Toast, Tabs, Tab, Badge, Spinner } from 'react-bootstrap'
import { useTranslation } from './i18n.jsx'
import { getUsername } from './auth'

const API_BASE = import.meta.env.VITE_API_BASE || '/api'

export default function SuperAdmin() {
  const [activeTab, setActiveTab] = useState('users')
  const [users, setUsers] = useState([])
  const [pending, setPending] = useState([])
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState(null)
  const [toast, setToast] = useState({ show: false, msg: '', variant: 'success' })
  const { t } = useTranslation()
  const currentUsername = getUsername()

  useEffect(() => { 
    loadUsers()
    loadPending()
  }, [])

  async function loadUsers() {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/admin/users`, { 
        headers: { 'Authorization': 'Bearer ' + localStorage.getItem('crm_token') } 
      })
      if (res.ok) {
        const data = await res.json()
        setUsers(data)
      }
    } catch (err) {
      console.error('Failed to load users', err)
    } finally {
      setLoading(false)
    }
  }

  async function loadPending() {
    try {
      const res = await fetch(`${API_BASE}/admin/pending`, { 
        headers: { 'Authorization': 'Bearer ' + localStorage.getItem('crm_token') } 
      })
      if (res.ok) {
        const data = await res.json()
        setPending(data)
      }
    } catch (err) {
      console.error('Failed to load pending users', err)
    }
  }

  async function deleteUser(userId, username) {
    if (!confirm(t('confirmDeleteUser'))) return

    try {
      setActionLoading(userId)
      const res = await fetch(`${API_BASE}/admin/users/${userId}`, { 
        method: 'DELETE',
        headers: { 'Authorization': 'Bearer ' + localStorage.getItem('crm_token') } 
      })

      if (res.ok) {
        setToast({ show: true, msg: `${username} ${t('userDeleted')}`, variant: 'success' })
        loadUsers()
      } else {
        let text = ''
        try { text = await res.text() } catch (e) { }
        setToast({ show: true, msg: `${t('deleteFailed')}: ${res.status} ${text}`, variant: 'danger' })
      }
    } catch (err) {
      setToast({ show: true, msg: `${t('deleteFailed')}: ${err.message}`, variant: 'danger' })
    } finally {
      setActionLoading(null)
      setTimeout(() => setToast({ ...toast, show: false }), 3000)
    }
  }

  async function disableUser(userId, username) {
    if (!confirm(t('confirmDisableUser'))) return

    try {
      setActionLoading(userId)
      const res = await fetch(`${API_BASE}/admin/users/${userId}/disable`, { 
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + localStorage.getItem('crm_token') } 
      })

      if (res.ok) {
        setToast({ show: true, msg: `${username} ${t('userDisabled')}`, variant: 'warning' })
        loadUsers()
      } else {
        let text = ''
        try { text = await res.text() } catch (e) { }
        setToast({ show: true, msg: `${t('disableFailed')}: ${res.status} ${text}`, variant: 'danger' })
      }
    } catch (err) {
      setToast({ show: true, msg: `${t('disableFailed')}: ${err.message}`, variant: 'danger' })
    } finally {
      setActionLoading(null)
      setTimeout(() => setToast({ ...toast, show: false }), 3000)
    }
  }

  async function approve(id) {
    try {
      setActionLoading(id)
      const res = await fetch(`${API_BASE}/admin/approve/${id}`, { 
        method: 'POST', 
        headers: { 'Authorization': 'Bearer ' + localStorage.getItem('crm_token') } 
      })

      if (res.ok) {
        const user = pending.find(u => u.id === id)
        setToast({ show: true, msg: `${user?.username || t('user')} ${t('toast.userApproved')}`, variant: 'success' })
        loadPending()
        loadUsers()
      } else {
        let text = ''
        try { text = await res.text() } catch (e) { }
        setToast({ show: true, msg: `${t('toast.approveFailed')}: ${res.status} ${text}`, variant: 'danger' })
      }
    } finally {
      setActionLoading(null)
      setTimeout(() => setToast({ ...toast, show: false }), 3000)
    }
  }

  async function deny(id) {
    try {
      setActionLoading(id)
      const res = await fetch(`${API_BASE}/admin/deny/${id}`, { 
        method: 'POST', 
        headers: { 'Authorization': 'Bearer ' + localStorage.getItem('crm_token') } 
      })

      if (res.ok) {
        const user = pending.find(u => u.id === id)
        setToast({ show: true, msg: `${user?.username || t('user')} ${t('toast.userDenied')}`, variant: 'warning' })
        loadPending()
      } else {
        let text = ''
        try { text = await res.text() } catch (e) { }
        setToast({ show: true, msg: `${t('toast.denyFailed')}: ${res.status} ${text}`, variant: 'danger' })
      }
    } finally {
      setActionLoading(null)
      setTimeout(() => setToast({ ...toast, show: false }), 3000)
    }
  }

  const getRoleBadgeVariant = (role) => {
    switch (role) {
      case 'big_boss': return 'danger'
      case 'agent_manager': return 'warning'
      case 'sales_agent': return 'info'
      default: return 'secondary'
    }
  }

  return (
    <Container className="py-4">
      <Card className="shadow-lg border-0">
        <Card.Body className="p-4">
          <div className="d-flex align-items-center mb-4">
            <i className="bi bi-shield-lock-fill me-3" style={{ fontSize: '2.5rem', color: 'var(--primary)' }}></i>
            <div>
              <h2 className="mb-0 fw-bold">{t('superAdmin')}</h2>
              <p className="text-secondary mb-0">{t('userManagement')}</p>
            </div>
          </div>

          <div style={{ position: 'relative' }}>
            <Toast 
              show={toast.show} 
              bg={toast.variant} 
              onClose={() => setToast({ ...toast, show: false })} 
              style={{ position: 'fixed', right: 20, top: 80, zIndex: 9999 }}
              autohide
              delay={3000}
            >
              <Toast.Body className="text-white">{toast.msg}</Toast.Body>
            </Toast>

            <Tabs 
              activeKey={activeTab} 
              onSelect={(k) => setActiveTab(k)} 
              className="mb-3"
            >
              <Tab eventKey="users" title={
                <span>
                  <i className="bi bi-people-fill me-2"></i>
                  {t('activeUsers')}
                  <Badge bg="primary" className="ms-2">{users.length}</Badge>
                </span>
              }>
                <Card className="border-0 shadow-sm">
                  <Card.Body>
                    {loading ? (
                      <div className="text-center py-5">
                        <Spinner animation="border" variant="primary" />
                      </div>
                    ) : users.length === 0 ? (
                      <div className="text-center py-5 text-secondary">
                        <i className="bi bi-people" style={{ fontSize: '3rem' }}></i>
                        <p className="mt-3">{t('noActiveUsers')}</p>
                      </div>
                    ) : (
                      <Table hover responsive>
                        <thead>
                          <tr>
                            <th>{t('username')}</th>
                            <th>{t('email')}</th>
                            <th>{t('userRoles')}</th>
                            <th className="text-end">{t('actions')}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {users.map(user => (
                            <tr key={user.id}>
                              <td>
                                <i className="bi bi-person-circle me-2"></i>
                                <strong>{user.username}</strong>
                              </td>
                              <td>{user.email}</td>
                              <td>
                                {user.roles.map(role => (
                                  <Badge 
                                    key={role} 
                                    bg={getRoleBadgeVariant(role)} 
                                    className="me-1"
                                  >
                                    {t(`roles.${role}`)}
                                  </Badge>
                                ))}
                              </td>
                              <td className="text-end">
                                {/* Hide disable button if user is self, or if target is big_boss and current user is not the first big_boss */}
                                {!user.isSelf && !(user.isBigBoss && !users.find(u => u.isFirstBigBoss && u.username === currentUsername)) && (
                                  <Button 
                                    size="sm" 
                                    variant="outline-warning" 
                                    className="me-2" 
                                    onClick={() => disableUser(user.id, user.username)}
                                    disabled={actionLoading === user.id}
                                  >
                                    <i className="bi bi-x-circle me-1"></i>
                                    {t('disableUser')}
                                  </Button>
                                )}
                                {/* Hide delete button if user is self */}
                                {!user.isSelf && (
                                  <Button 
                                    size="sm" 
                                    variant="outline-danger" 
                                    onClick={() => deleteUser(user.id, user.username)}
                                    disabled={actionLoading === user.id}
                                  >
                                    <i className="bi bi-trash me-1"></i>
                                    {t('deleteUser')}
                                  </Button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    )}
                  </Card.Body>
                </Card>
              </Tab>

              <Tab eventKey="pending" title={
                <span>
                  <i className="bi bi-hourglass-split me-2"></i>
                  {t('pendingRegistrations')}
                  <Badge bg="warning" className="ms-2">{pending.length}</Badge>
                </span>
              }>
                <Card className="border-0 shadow-sm">
                  <Card.Body>
                    {pending.length === 0 ? (
                      <div className="text-center py-5 text-secondary">
                        <i className="bi bi-check-circle" style={{ fontSize: '3rem' }}></i>
                        <p className="mt-3">{t('noPendingUsers')}</p>
                      </div>
                    ) : (
                      <Table hover responsive>
                        <thead>
                          <tr>
                            <th>{t('name')}</th>
                            <th>{t('email')}</th>
                            <th>{t('requestedRole')}</th>
                            <th className="text-end">{t('actions')}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pending.map(user => (
                            <tr key={user.id}>
                              <td>
                                <i className="bi bi-person-plus me-2"></i>
                                <strong>{user.username}</strong>
                              </td>
                              <td>{user.email}</td>
                              <td>
                                <Badge bg={getRoleBadgeVariant(user.requestedRole)}>
                                  {t(`roles.${user.requestedRole}`)}
                                </Badge>
                              </td>
                              <td className="text-end">
                                <Button 
                                  size="sm" 
                                  variant="success" 
                                  className="me-2" 
                                  onClick={() => approve(user.id)} 
                                  disabled={actionLoading === user.id}
                                >
                                  <i className="bi bi-check-circle me-1"></i>
                                  {t('approve')}
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="danger" 
                                  onClick={() => deny(user.id)} 
                                  disabled={actionLoading === user.id}
                                >
                                  <i className="bi bi-x-circle me-1"></i>
                                  {t('deny')}
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    )}
                  </Card.Body>
                </Card>
              </Tab>
            </Tabs>
          </div>
        </Card.Body>
      </Card>
    </Container>
  )
}
