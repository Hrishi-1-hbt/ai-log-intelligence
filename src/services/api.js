import axios from 'axios'

// ──────────────────────────────────────────
// Axios Instance
// Base URL points to Spring Boot backend
// ──────────────────────────────────────────
const api = axios.create({
  baseURL: 'http://localhost:8080',
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// ──────────────────────────────────────────
// Request Interceptor
// Logs every outgoing request in development
// ──────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    console.log(`��� API Request → ${config.method.toUpperCase()} ${config.url}`)
    return config
  },
  (error) => Promise.reject(error)
)

// ──────────────────────────────────────────
// Response Interceptor
// Handles errors globally
// ──────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('❌ API Error:', error.message)
    return Promise.reject(error)
  }
)

// ══════════════════════════════════════════
// LOG ENDPOINTS
// ══════════════════════════════════════════

// POST /api/logs/ingest
// Send array of log lines for analysis
export const ingestLogs = (logLines) =>
  api.post('/api/logs/ingest', logLines)

// POST /api/logs/upload
// Upload a .log or .txt file
export const uploadLogFile = (file) => {
  const formData = new FormData()
  formData.append('file', file)
  return api.post('/api/logs/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

// POST /api/logs/analyze
// Analyze a single log line
export const analyzeSingleLog = (logLine) =>
  api.post('/api/logs/analyze', { log: logLine })

// ══════════════════════════════════════════
// GET ENDPOINTS
// ══════════════════════════════════════════

// GET /api/logs/anomalies
// Fetch all anomalies from database
export const fetchAnomalies = () =>
  api.get('/api/logs/anomalies')

// GET /api/logs/recent
// Fetch last 50 log entries
export const fetchRecentLogs = () =>
  api.get('/api/logs/recent')

// GET /api/logs/stats
// Fetch dashboard statistics
export const fetchStats = () =>
  api.get('/api/logs/stats')

// GET /api/logs/summary
// Fetch AI health summary from Ollama
export const fetchAiSummary = () =>
  api.get('/api/logs/summary')

// GET /api/logs/anomalies/{type}
// Fetch anomalies filtered by type
export const fetchAnomaliesByType = (type) =>
  api.get(`/api/logs/anomalies/${type}`)

export default api
