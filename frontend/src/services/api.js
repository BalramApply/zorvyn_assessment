import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('fv_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// On 401 → clear session and redirect to login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('fv_token')
      localStorage.removeItem('fv_user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// ─── Auth ──────────────────────────────────────────────────────
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  registerAdmin: (data) => api.post('/auth/register-admin', data),
  me: () => api.get('/auth/me'),
}

// ─── Transactions ──────────────────────────────────────────────
export const txAPI = {
  getAll: (params) => api.get('/transactions', { params }),
  getById: (id) => api.get(`/transactions/${id}`),
  create: (data) => api.post('/transactions', data),
  update: (id, data) => api.patch(`/transactions/${id}`, data),
  delete: (id) => api.delete(`/transactions/${id}`),
}

// ─── Dashboard ─────────────────────────────────────────────────
export const dashAPI = {
  overview: () => api.get('/dashboard/overview'),
  categories: () => api.get('/dashboard/categories'),
  monthly: (year) => api.get('/dashboard/monthly', { params: { year } }),
  recent: (limit = 8) => api.get('/dashboard/recent', { params: { limit } }),
  weekly: (weeks = 8) => api.get('/dashboard/weekly', { params: { weeks } }),
}

// ─── Users ─────────────────────────────────────────────────────
export const usersAPI = {
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  update: (id, data) => api.patch(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
}

export default api