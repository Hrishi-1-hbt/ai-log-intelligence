import { create } from 'zustand'

const useLogStore = create((set, get) => ({

  // ──────────────────────────────────────────
  // State
  // ──────────────────────────────────────────
  logs:       [],        // All log entries
  anomalies:  [],        // Anomaly entries only
  alerts:     [],        // WebSocket alert toasts
  stats: {
    totalLogs:      0,
    totalAnomalies: 0,
    anomalyRate:    '0.0%',
    byType:         {},
    bySeverity:     {},
    byLevel:        {},
  },
  isLoading:    false,   // Loading state for API calls
  isConnected:  false,   // WebSocket connection status
  activeTab:    'dashboard', // Current active page

  // ──────────────────────────────────────────
  // Log Actions
  // ──────────────────────────────────────────

  // Add a batch of logs after ingest/upload
  addLogs: (newLogs) => set((state) => ({
    logs: [...newLogs, ...state.logs].slice(0, 500),
  })),

  // Add a single log via WebSocket stream
  addLogEntry: (entry) => set((state) => ({
    logs: [entry, ...state.logs].slice(0, 500),
  })),

  // ──────────────────────────────────────────
  // Anomaly Actions
  // ──────────────────────────────────────────

  // Add a batch of anomalies after ingest/upload
  addAnomalies: (newAnomalies) => set((state) => ({
    anomalies: [...newAnomalies, ...state.anomalies],
  })),

  // Add a single anomaly via WebSocket stream
  addAnomaly: (anomaly) => set((state) => ({
    anomalies: [anomaly, ...state.anomalies],
  })),

  // ──────────────────────────────────────────
  // Alert Toast Actions
  // ──────────────────────────────────────────

  // Add a new alert toast (shown for 6 seconds)
  addAlert: (alert) => set((state) => ({
    alerts: [{ ...alert, id: Date.now() }, ...state.alerts].slice(0, 5),
  })),

  // Remove alert toast by id
  removeAlert: (id) => set((state) => ({
    alerts: state.alerts.filter((a) => a.id !== id),
  })),

  // ──────────────────────────────────────────
  // Stats Actions
  // ──────────────────────────────────────────

  // Update stats from API response
  setStats: (stats) => set({ stats }),

  // ──────────────────────────────────────────
  // UI Actions
  // ──────────────────────────────────────────

  // Set loading state
  setLoading: (isLoading) => set({ isLoading }),

  // Set WebSocket connection status
  setConnected: (isConnected) => set({ isConnected }),

  // Set active tab
  setActiveTab: (activeTab) => set({ activeTab }),

  // ──────────────────────────────────────────
  // Clear Actions
  // ──────────────────────────────────────────

  // Clear everything — reset to initial state
  clearAll: () => set({
    logs:      [],
    anomalies: [],
    alerts:    [],
    stats: {
      totalLogs:      0,
      totalAnomalies: 0,
      anomalyRate:    '0.0%',
      byType:         {},
      bySeverity:     {},
      byLevel:        {},
    },
  }),

}))

export default useLogStore
