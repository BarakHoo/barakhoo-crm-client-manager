// Simple auth helpers for the frontend
export function saveToken(token) {
  try { localStorage.setItem('crm_token', token) } catch (e) { /* ignore */ }
}

export function getToken() {
  try { return localStorage.getItem('crm_token') } catch (e) { return null }
}

export function clearToken() {
  try { localStorage.removeItem('crm_token') } catch (e) { /* ignore */ }
}

export function parseJwt(token) {
  if (!token) return null
  try {
    const payload = token.split('.')[1]
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(decoded)
  } catch (e) {
    return null
  }
}

export function getRoles() {
  const t = getToken()
  const p = parseJwt(t)
  return p && p.roles ? p.roles : []
}

export function getUsername() {
  const t = getToken()
  const p = parseJwt(t)
  if (!p) return null
  return p.sub || p.username || null
}

export function authFetch(url, opts = {}) {
  const token = getToken()
  opts.headers = opts.headers || {}
  if (token) opts.headers['Authorization'] = 'Bearer ' + token
  return fetch(url, opts)
}
