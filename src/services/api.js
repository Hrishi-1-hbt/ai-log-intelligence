import axios from 'axios'

// ──────────────────────────────────────────
// Use environment variable for API URL
// Falls back to localhost for development
// ──────────────────────────────────────────
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use(
  (config) => {
    console.log(`📡 API Request → ${config.method.toUpperCase()} ${config.url}`)
    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('❌ API Error:', error.message)
    return Promise.reject(error)
  }
)

// ── Log Endpoints ──────────────────────────
export const ingestLogs      = (logLines) => api.post('/api/logs/ingest', logLines)
export const uploadLogFile   = (file) => {
  const formData = new FormData()
  formData.append('file', file)
  return api.post('/api/logs/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}
export const analyzeSingleLog    = (logLine)  => api.post('/api/logs/analyze', { log: logLine })
export const fetchAnomalies      = ()         => api.get('/api/logs/anomalies')
export const fetchRecentLogs     = ()         => api.get('/api/logs/recent')
export const fetchStats          = ()         => api.get('/api/logs/stats')
export const fetchAiSummary      = ()         => api.get('/api/logs/summary')
export const fetchAnomaliesByType = (type)    => api.get(`/api/logs/anomalies/${type}`)

export default api