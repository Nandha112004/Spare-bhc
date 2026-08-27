import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

const client = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' }
})

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('spare_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

client.interceptors.response.use(
  (res) => res,
  (err) => {
    const msg = err.response?.data?.detail || err.message
    // don't auto-logout on 400 etc, only 401
    if (err.response?.status === 401 && window.location.pathname !== '/login') {
      // optional: localStorage.removeItem('spare_token')
    }
    return Promise.reject(err)
  }
)

export default client
