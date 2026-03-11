import SockJS from 'sockjs-client'
import { Client } from '@stomp/stompjs'

// ──────────────────────────────────────────
// WebSocket Client
// Connects to Spring Boot WebSocket endpoint
// ──────────────────────────────────────────
let stompClient = null

// ══════════════════════════════════════════
// Connect to WebSocket
// Called once when App loads
// ══════════════════════════════════════════
export const connectWebSocket = ({
  onAlert,       // Called when anomaly alert arrives
  onLogUpdate,   // Called when new log entry arrives
  onCritical,    // Called when CRITICAL alert arrives
  onStatsUpdate, // Called when stats update arrives
  onConnect,     // Called when connection is established
  onDisconnect,  // Called when connection is lost
}) => {

  stompClient = new Client({

    // ──────────────────────────────────────────
    // SockJS Factory
    // Creates WebSocket connection to Spring Boot
    // ──────────────────────────────────────────
    webSocketFactory: () =>
      new SockJS(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/ws`),

    // ──────────────────────────────────────────
    // Reconnect automatically if connection drops
    // Tries every 5 seconds
    // ──────────────────────────────────────────
    reconnectDelay: 5000,

    // ──────────────────────────────────────────
    // On Connected — Subscribe to all channels
    // ──────────────────────────────────────────
    onConnect: () => {
      console.log('✅ WebSocket connected to Spring Boot')
      onConnect?.()

      // Channel 1 — Anomaly alerts
      stompClient.subscribe('/topic/alerts', (message) => {
        try {
          const alert = JSON.parse(message.body)
          console.log('Alert received:', alert.anomalyType)
          onAlert?.(alert)
        } catch (e) {
          console.error('Failed to parse alert:', e)
        }
      })

      // Channel 2 — Live log stream
      stompClient.subscribe('/topic/logs', (message) => {
        try {
          const logEntry = JSON.parse(message.body)
          onLogUpdate?.(logEntry)
        } catch (e) {
          console.error('Failed to parse log entry:', e)
        }
      })

      // Channel 3 — Critical alerts only
      stompClient.subscribe('/topic/critical', (message) => {
        try {
          const alert = JSON.parse(message.body)
          console.log('CRITICAL alert received:', alert.anomalyType)
          onCritical?.(alert)
        } catch (e) {
          console.error('Failed to parse critical alert:', e)
        }
      })

      // Channel 4 — Stats updates
      stompClient.subscribe('/topic/stats', (message) => {
        try {
          const stats = JSON.parse(message.body)
          onStatsUpdate?.(stats)
        } catch (e) {
          console.error('Failed to parse stats:', e)
        }
      })
    },

    // ──────────────────────────────────────────
    // On Disconnected
    // ──────────────────────────────────────────
    onDisconnect: () => {
      console.log(' WebSocket disconnected')
      onDisconnect?.()
    },

    // ──────────────────────────────────────────
    // On Error
    // ──────────────────────────────────────────
    onStompError: (frame) => {
      console.error('WebSocket STOMP error:', frame)
      onDisconnect?.()
    },
  })

  // Activate the connection
  stompClient.activate()
  return stompClient
}

// ══════════════════════════════════════════
// Disconnect WebSocket
// Called when App unmounts
// ══════════════════════════════════════════
export const disconnectWebSocket = () => {
  if (stompClient) {
    stompClient.deactivate()
    console.log('WebSocket disconnected cleanly')
  }
}

export default stompClient
