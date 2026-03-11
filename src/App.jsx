import { useEffect } from 'react'
import useLogStore from './store/useLogStore'
import { connectWebSocket, disconnectWebSocket } from './services/websocket'
import { fetchStats, fetchRecentLogs, fetchAnomalies } from './services/api'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import AlertToast from './components/AlertToast'
import Dashboard from './pages/Dashboard'
import Anomalies from './pages/Anomalies'
import AllLogs from './pages/AllLogs'
import AiSummary from './pages/AiSummary'

export default function App() {
  const {
    activeTab,
    setConnected,
    addAlert,
    addAnomaly,
    addLogEntry,
    setStats,
    addLogs,
    addAnomalies,
  } = useLogStore()

  useEffect(() => {
    connectWebSocket({
      onAlert:       (alert)    => { addAlert(alert); addAnomaly(alert) },
      onLogUpdate:   (logEntry) => { addLogEntry(logEntry) },
      onCritical:    (alert)    => { addAlert({ ...alert, severity: 'CRITICAL' }) },
      onStatsUpdate: (stats)    => {
        setStats({
          totalLogs:      stats.totalLogs      || 0,
          totalAnomalies: stats.totalAnomalies || 0,
          anomalyRate:    `${((stats.totalAnomalies / Math.max(stats.totalLogs, 1)) * 100).toFixed(1)}%`,
          byType:     {},
          bySeverity: {},
          byLevel:    {},
        })
      },
      onConnect:    () => setConnected(true),
      onDisconnect: () => setConnected(false),
    })

    const loadInitialData = async () => {
      try {
        const statsRes     = await fetchStats()
        setStats(statsRes.data)
        const logsRes      = await fetchRecentLogs()
        if (logsRes.data?.length)      addLogs(logsRes.data)
        const anomaliesRes = await fetchAnomalies()
        if (anomaliesRes.data?.length) addAnomalies(anomaliesRes.data)
        console.log('✅ Initial data loaded')
      } catch (err) {
        console.warn('⚠️ Backend not reachable — offline mode')
      }
    }

    loadInitialData()
    return () => disconnectWebSocket()
  }, [])

  const renderPage = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />
      case 'anomalies': return <Anomalies />
      case 'logs':      return <AllLogs />
      case 'summary':   return <AiSummary />
      default:          return <Dashboard />
    }
  }

  return (
    <div style={{ position: 'relative', zIndex: 1 }}>
      <AlertToast />
      <Header />
      <div style={{ display: 'flex', minHeight: 'calc(100vh - 70px)' }}>
        <Sidebar />
        <main style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          {renderPage()}
        </main>
      </div>
    </div>
  )
}