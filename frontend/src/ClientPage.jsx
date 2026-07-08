import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Container, Card, Row, Col, Button, Badge, ListGroup, Form, Spinner, Tabs, Tab } from 'react-bootstrap'
import { getToken, getRoles } from './auth'
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

export default function ClientPage() {
  const { id } = useParams()
  // id may be a code; we'll call the API by code route
  const nav = useNavigate()
  const [client, setClient] = useState(null)
  const [loading, setLoading] = useState(true)
  const [note, setNote] = useState('')
  const { t } = useTranslation()
  const roles = getRoles()

  useEffect(() => { fetchClient() }, [id])

  async function fetchClient() {
    setLoading(true)
    const isUuid = /^[0-9a-fA-F-]{36}$/.test(id)
    const path = isUuid ? `${API_BASE}/clients/${id}` : `${API_BASE}/clients/code/${id}`
    const res = await fetch(path, { headers: { 'Authorization': 'Bearer ' + getToken() } })
    if (!res.ok) {
      setLoading(false)
      return
    }
    const data = await res.json()
    setClient(data)
    setLoading(false)
  }

  async function submitNote(e) {
    e.preventDefault()
    if (!note.trim()) return
    const isUuid = /^[0-9a-fA-F-]{36}$/.test(id)
    const notesPath = isUuid ? `${API_BASE}/clients/${id}/notes` : `${API_BASE}/clients/code/${id}/notes`
    await fetch(notesPath, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + getToken() }, body: JSON.stringify({ note }) })
    setNote('')
    fetchClient()
  }

  function sanitizeTel(p) {
    if (!p) return '#'
    return 'tel:' + p.replace(/[^0-9+]/g, '')
  }

  if (loading) return <div className="text-center py-4"><Spinner animation="border" /></div>
  if (!client) return <Container className="py-4">{t('noNotes')}</Container>

  // Prefer per-note entities (notesList), fallback to legacy notes string
  const notes = (client.notesList && client.notesList.length > 0)
    ? client.notesList.map(n => ({ id: n.id, content: n.content, createdAt: n.createdAt }))
    : (client.notes ? client.notes.split('\n').filter(n => n.trim()).map((n, i) => ({ id: `legacy-${i}`, content: n })) : [])

  return (
    <Container className="py-4">
      <Button variant="link" onClick={() => nav(-1)} className="mb-3">&larr; {t('back')}</Button>
      <Card className="shadow-sm mb-3">
        <Card.Body>
          <Row>
            <Col md={8}>
              <h3>{client.name} <Badge bg={statusVariant(client.status)} className="ms-2">{t(`status.${client.status}`)}</Badge></h3>
              <div className="text-muted">{client.company}</div>
            </Col>
            <Col md={4} className="text-md-end">
              <div>
                <Button href={sanitizeTel(client.phoneForCall)} variant="success" className="me-2"><i className="bi bi-telephone-fill"></i> {t('call')}</Button>
                <Button href={`mailto:${client.email}`} variant="outline-primary"><i className="bi bi-envelope-fill"></i> {t('emailBtn')}</Button>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Status change control */}
      <Card className="mb-3">
        <Card.Body>
          <Form.Group className="mb-2">
            <Form.Label>{t('changeStatus')}</Form.Label>
            <Form.Select value={client.status} onChange={async (e) => {
              const newStatus = e.target.value
              // call backend status by code
              await fetch(`${API_BASE}/clients/code/${client.code}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + getToken() }, body: JSON.stringify({ status: newStatus }) })
              fetchClient()
            }}>
              <option value="New">{t('status.New')}</option>
              <option value="Contacted">{t('status.Contacted')}</option>
              <option value="Interested">{t('status.Interested')}</option>
              <option value="NotInterested">{t('status.NotInterested')}</option>
              <option value="DoNotCall">{t('status.DoNotCall')}</option>
            </Form.Select>
          </Form.Group>
        </Card.Body>
      </Card>

      <Row>
        <Col md={6}>
          <Card className="shadow-sm mb-3">
            <Card.Body>
              <Card.Title>{t('contactDetails')}</Card.Title>
              <ListGroup variant="flush">
                <ListGroup.Item><strong>{t('company')}:</strong> {client.company || '—'}</ListGroup.Item>
                <ListGroup.Item><strong>{t('phone')}:</strong> {client.phone || '—'}</ListGroup.Item>
                <ListGroup.Item><strong>{t('email')}:</strong> {client.email || '—'}</ListGroup.Item>
                <ListGroup.Item><strong>{t('lastContact')}:</strong> {client.lastContact ? new Date(client.lastContact).toLocaleString() : t('never')}</ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>

          <Card className="shadow-sm">
            <Card.Body>
          <Card.Title>{t('addNote')}</Card.Title>
              <Form onSubmit={submitNote}>
                <Form.Group className="mb-2">
                  <Form.Control as="textarea" rows={3} value={note} onChange={e => setNote(e.target.value)} placeholder={t('notes')} />
                </Form.Group>
                <div>
                  <Button type="submit" variant="primary">{t('saveNote')}</Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="shadow-sm mb-3">
            <Card.Body>
              <Card.Title>{t('notesHistory')}</Card.Title>
              {notes.length === 0 ? (
                <div className="text-muted">{t('noNotes')}</div>
              ) : (
                <ListGroup>
                  {notes.map((n) => (
                    <ListGroup.Item key={n.id} className="d-flex justify-content-between align-items-start">
                      <div>
                        <div>{n.content}</div>
                        {n.createdAt && <div className="text-muted small mt-1">{new Date(n.createdAt).toLocaleString()}</div>}
                      </div>
                      <div className="btn-group">
                        {!String(n.id).startsWith('legacy-') && (
                          <>
                            <Button size="sm" variant="outline-secondary" className="me-1" onClick={async () => {
                              const newVal = prompt(t('prompt.editNote'), n.content)
                              if (!newVal) return
                              await fetch(`${API_BASE}/clients/notes/${n.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + getToken() }, body: JSON.stringify({ note: newVal }) })
                              fetchClient()
                            }}><i className="bi bi-pencil"></i></Button>
                            <Button size="sm" variant="outline-danger" onClick={async () => { if (confirm(t('confirm.deleteNote'))) { await fetch(`${API_BASE}/clients/notes/${n.id}`, { method: 'DELETE', headers: { 'Authorization': 'Bearer ' + getToken() } }); fetchClient(); } }}><i className="bi bi-trash"></i></Button>
                          </>
                        )}
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </Card.Body>
          </Card>

          <Card className="shadow-sm">
            <Card.Body>
              <Card.Title>{t('actions')}</Card.Title>
              <div className="d-flex flex-column">
                <Button variant="outline-secondary" className="mb-2" onClick={() => nav('/')}>{t('returnToList')}</Button>
                {/* Only show delete button for agent_manager and big_boss */}
                {(roles.includes('agent_manager') || roles.includes('big_boss')) && (
                  <Button variant="danger" onClick={async () => { if (confirm(t('confirm.deleteClient'))) { const isUuid = /^[0-9a-fA-F-]{36}$/.test(id); const delPath = isUuid ? `${API_BASE}/clients/${id}` : `${API_BASE}/clients/code/${id}`; await fetch(delPath, { method: 'DELETE', headers: { 'Authorization': 'Bearer ' + getToken() } }); nav('/'); } }}>{t('deleteClientBtn')}</Button>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}
