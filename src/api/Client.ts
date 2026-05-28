import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

// Injeta o token JWT em toda requisição
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('lc_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Se expirar o token, redireciona para login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('lc_token')
      localStorage.removeItem('lc_user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api