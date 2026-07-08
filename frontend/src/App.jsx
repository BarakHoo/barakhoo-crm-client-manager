import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Container, Row, Col, Form, Button, Table, Card, Badge, Modal, Toast, Spinner } from 'react-bootstrap'
import { getToken, getRoles, getUsername, clearToken } from './auth'
import { useTranslation } from './i18n.jsx'

const API_BASE = import.meta.env.VITE_API_BASE || '/api'

const statusVariant = (s) => {
  switch (s) {
    case 'New': return 'primary'
    case 'Contacted': return 'info'
    case 'Interested': return 'success'
    case 'NotInterested': return 'secondary'
    case 'DoNotCall': return 'dark'
    default: return 'light'
  }
}

export default function App() {
  const nav = useNavigate()
  const [clients, setClients] = useState([])
  const [availableAgents, setAvailableAgents] = useState([])
  const [term, setTerm] = useState('')
  const [form, setForm] = useState({ name: '', company: '', phone: '', email: '', notes: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState({ show: false, msg: '', variant: 'success' })
  const [noteModal, setNoteModal] = useState({ show: false, id: null, note: '' })
  const [statusModal, setStatusModal] = useState({ show: false, id: null, status: '' })

  useEffect(() => { 
    load()
    if (roles.includes('agent_manager') || roles.includes('big_boss')) {
      loadAvailableAgents()
    }
  }, [])

  const roles = getRoles()
  const username = getUsername()
  const { t } = useTranslation()

  async function loadAvailableAgents() {
    try {
      const res = await fetch(`${API_BASE}/clients/agents`, { 
        headers: { 'Authorization': 'Bearer ' + getToken() } 
      })
      if (res.ok) {
        const agents = await res.json()
        setAvailableAgents(agents)
      }
    } catch (err) {
      console.error('Failed to load agents:', err)
    }
  }

  async function load(search) {
    setLoading(true)
    const q = search ? `?search=${encodeURIComponent(search)}` : ''
    const res = await fetch(`${API_BASE}/clients${q}`, { headers: { 'Authorization': 'Bearer ' + getToken() } })
    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        // not authorized -> redirect to login
        setLoading(false)
        try { nav('/login') } catch (e) { /* ignore if nav not available */ }
        return
      }
      // try to read text for error details, avoid calling res.json on empty/invalid body
      let text = ''
      try { text = await res.text() } catch (e) { /* ignore */ }
      setToast({ show: true, msg: `Failed to load clients: ${res.status} ${text}`, variant: 'danger' })
      setLoading(false)
      return
    }
    const data = await res.json()
    setClients(data)
    setLoading(false)
  }

  function validateForm(values) {
    const errs = {}
    if (!values.name || !values.name.trim()) errs.name = 'Name is required'
    if (values.phone && !/^[0-9+\- ()]{7,20}$/.test(values.phone)) errs.phone = 'Phone must be 7-20 characters, digits and + - ( ) allowed'
    if (values.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(values.email)) errs.email = 'Email is invalid'
    if (values.notes && values.notes.length > 1000) errs.notes = 'Notes must be at most 1000 characters'
    return errs
  }

  async function submit(e) {
    e.preventDefault()
    const v = validateForm(form)
    setErrors(v)
    if (Object.keys(v).length) return

    // Client-side duplicate checks against currently loaded clients
    const dupEmail = form.email && clients.some(c => c.email && c.email.toLowerCase() === form.email.toLowerCase())
    const dupPhone = form.phone && clients.some(c => c.phone && c.phone.replace(/[^0-9+]/g, '') === form.phone.replace(/[^0-9+]/g, ''))
    const dupNameCompany = form.name && form.company && clients.some(c => c.name && c.company && c.name.toLowerCase() === form.name.toLowerCase() && c.company.toLowerCase() === form.company.toLowerCase())
    if (dupEmail || dupPhone || dupNameCompany) {
      setToast({ show: true, msg: 'Duplicate client detected (email, phone, or name+company).', variant: 'danger' })
      return
    }

    const res = await fetch(`${API_BASE}/clients`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + getToken() }, body: JSON.stringify(form) })
    if (!res.ok) {
      const text = await res.text()
      setToast({ show: true, msg: `Server rejected: ${res.status} ${text}`, variant: 'danger' })
      return
    }
    setForm({ name: '', company: '', phone: '', email: '', notes: '' })
    setToast({ show: true, msg: t('toast.clientAdded') || 'Client added', variant: 'success' })
    load()
  }

  async function deleteClient(id) {
    if (!confirm(t('confirm.deleteClient') || 'Delete client?')) return
    await fetch(`${API_BASE}/clients/code/${id}`, { method: 'DELETE', headers: { 'Authorization': 'Bearer ' + getToken() } })
    setToast({ show: true, msg: t('toast.deleted') || 'Deleted', variant: 'warning' })
    load()
  }

  async function assignClient(clientId, assignedAgentUsername) {
    try {
      const res = await fetch(`${API_BASE}/clients/${clientId}/assign`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + getToken() },
        body: JSON.stringify({ assignedAgentUsername: assignedAgentUsername || null })
      })
      if (res.ok) {
        setToast({ show: true, msg: t('assignmentUpdated') || 'Assignment updated', variant: 'success' })
        load()
      } else {
        setToast({ show: true, msg: t('error') || 'Error', variant: 'danger' })
      }
    } catch (err) {
      setToast({ show: true, msg: t('error') || 'Error', variant: 'danger' })
    }
  }

  async function appendNote(id) {
    const note = prompt(t('prompt.editNote') || 'Note to append:')
    if (!note) return
    await fetch(`${API_BASE}/clients/code/${id}/notes`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + getToken() }, body: JSON.stringify({ note }) })
    load()
  }

  function openNoteModal(id) {
    setNoteModal({ show: true, id, note: '' })
  }

  async function submitNote() {
    if (!noteModal.note.trim()) return
    await fetch(`${API_BASE}/clients/code/${noteModal.id}/notes`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + getToken() }, body: JSON.stringify({ note: noteModal.note }) })
    setNoteModal({ show: false, id: null, note: '' })
    setToast({ show: true, msg: 'Note added', variant: 'success' })
    load()
  }

  function openStatusModal(id) {
    setStatusModal({ show: true, id, status: 'New' })
  }

  async function submitStatus() {
    await fetch(`${API_BASE}/clients/code/${statusModal.id}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + getToken() }, body: JSON.stringify({ status: statusModal.status }) })
    setStatusModal({ show: false, id: null, status: '' })
    setToast({ show: true, msg: 'Status updated', variant: 'info' })
    load()
  }

  return (
    <>
      <Container>
        <Card className="mb-4 shadow-sm">
          <Card.Body>
            <Row className="align-items-center">
              <Col md={6} className="mb-2 mb-md-0">
                <Form.Control placeholder={t('search')} value={term} onChange={e => setTerm(e.target.value)} />
              </Col>
              <Col md={6} className="text-md-end">
                <Button className="me-2" onClick={() => load(term)} variant="primary">{t('searchBtn')}</Button>
                <Button variant="secondary" onClick={() => { setTerm(''); load() }}>{t('clear')}</Button>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Only show Add Client form for managers and big bosses */}
        {(roles.includes('agent_manager') || roles.includes('big_boss')) && (
          <Card className="mb-4 shadow-sm">
            <Card.Body>
              <Card.Title>{t('addClient')}</Card.Title>
              <Form onSubmit={submit}>
              <Row className="g-2">
                <Col md={4}>
                  <Form.Group className="mb-2">
                    <Form.Label>{t('name')}</Form.Label>
                    <Form.Control isInvalid={!!errors.name} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                    <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-2">
                    <Form.Label>{t('company')}</Form.Label>
                    <Form.Control value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-2">
                    <Form.Label>{t('phone')}</Form.Label>
                    <Form.Control isInvalid={!!errors.phone} value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                    <Form.Control.Feedback type="invalid">{errors.phone}</Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>

              <Row className="g-2 mt-2">
                <Col md={6}>
                  <Form.Group className="mb-2">
                  <Form.Label>{t('email')}</Form.Label>
                    <Form.Control isInvalid={!!errors.email} value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                    <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-2">
                    <Form.Label>{t('notes')}</Form.Label>
                    <Form.Control isInvalid={!!errors.notes} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
                    <Form.Control.Feedback type="invalid">{errors.notes}</Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>

              <div className="mt-3">
                <Button type="submit" variant="success">{t('addClientBtn')}</Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
        )}

        <Card className="shadow-sm">
          <Card.Body>
            <Card.Title>{t('clients')}</Card.Title>
            {loading ? (
              <div className="text-center py-4"><Spinner animation="border" /></div>
            ) : (
              <div className="table-responsive">
                <Table hover className="align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>{t('table.name')}</th>
                      <th>{t('table.company')}</th>
                      <th>{t('table.phone')}</th>
                      <th>{t('table.email')}</th>
                      <th>{t('table.status')}</th>
                      {(roles.includes('agent_manager') || roles.includes('big_boss')) && <th>{t('assignedAgent')}</th>}
                      <th>{t('table.last')}</th>
                      <th>{t('table.actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clients.map(c => (
              <tr key={c.id}>
                <td>{c.code ? <Link to={`/clients/${c.code}`} className="text-decoration-none">{c.name}</Link> : <Link to={`/clients/${c.id}`} className="text-decoration-none">{c.name}</Link>}</td>
                        <td>{c.company}</td>
                        <td>{c.phone}</td>
                        <td>{c.email}</td>
                        <td><Badge bg={statusVariant(c.status)}>{t(`status.${c.status}`)}</Badge></td>
                        {(roles.includes('agent_manager') || roles.includes('big_boss')) && (
                          <td>
                            <Form.Select 
                              size="sm" 
                              value={c.assignedAgentUsername || ''} 
                              onChange={(e) => assignClient(c.id, e.target.value)}
                            >
                              <option value="">{t('unassigned')}</option>
                              {availableAgents.map(agent => (
                                <option key={agent} value={agent}>{agent}</option>
                              ))}
                            </Form.Select>
                          </td>
                        )}
                        <td>{c.lastContact ? new Date(c.lastContact).toLocaleString() : t('never')}</td>
                        <td>
                          <Button size="sm" variant="outline-primary" className="me-1" onClick={() => openNoteModal(c.code || c.id)}><i className="bi bi-chat-square-text"></i></Button>
                          <Button size="sm" variant="outline-secondary" className="me-1" onClick={() => openStatusModal(c.code || c.id)}><i className="bi bi-gear"></i></Button>
                          {(roles.includes('agent_manager') || roles.includes('big_boss')) && (
                            <Button size="sm" variant="outline-danger" onClick={() => deleteClient(c.code || c.id)}><i className="bi bi-trash"></i></Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}
          </Card.Body>
        </Card>
      </Container>

      <Modal show={noteModal.show} onHide={() => setNoteModal({ show: false, id: null, note: '' })}>
        <Modal.Header closeButton>
          <Modal.Title>{t('noteModalTitle')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>{t('notes')}</Form.Label>
            <Form.Control as="textarea" rows={4} value={noteModal.note} onChange={e => setNoteModal({ ...noteModal, note: e.target.value })} />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setNoteModal({ show: false, id: null, note: '' })}>{t('cancel')}</Button>
          <Button variant="primary" onClick={submitNote}>{t('saveNote')}</Button>
        </Modal.Footer>
      </Modal>

      <Modal show={statusModal.show} onHide={() => setStatusModal({ show: false, id: null, status: '' })}>
        <Modal.Header closeButton>
          <Modal.Title>{t('statusModalTitle')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>{t('changeStatus')}</Form.Label>
            <Form.Select value={statusModal.status} onChange={e => setStatusModal({ ...statusModal, status: e.target.value })}>
              <option>{t('status.New')}</option>
              <option>{t('status.Contacted')}</option>
              <option>{t('status.Interested')}</option>
              <option>{t('status.NotInterested')}</option>
              <option>{t('status.DoNotCall')}</option>
            </Form.Select>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setStatusModal({ show: false, id: null, status: '' })}>{t('cancel')}</Button>
          <Button variant="primary" onClick={submitStatus}>{t('save')}</Button>
        </Modal.Footer>
      </Modal>

      <Toast show={toast.show} bg={toast.variant} onClose={() => setToast({ ...toast, show: false })} style={{ position: 'fixed', right: 20, bottom: 20 }}>
        <Toast.Body className="text-white">{toast.msg}</Toast.Body>
      </Toast>
    </>
  )
}
