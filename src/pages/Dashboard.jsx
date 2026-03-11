import { useState, useRef } from 'react'
import { Search, FileText, Trash2, FolderOpen } from 'lucide-react'
import StatsBar from '../components/StatsBar'
import LogStream from '../components/LogStream'
import useLogStore from '../store/useLogStore'
import { ingestLogs, uploadLogFile, fetchStats } from '../services/api'

const SAMPLE_LOGS = `2024-01-15 10:32:01 INFO  AppStartup - Application initialized successfully
2024-01-15 10:32:14 INFO  UserService - User login: user@example.com
2024-01-15 10:32:15 ERROR AppContext - java.lang.OutOfMemoryError: Java heap space
2024-01-15 10:32:16 INFO  HealthCheck - Database ping OK
2024-01-15 10:32:17 WARN  ConnectionPool - Pool size approaching maximum 48/50
2024-01-15 10:32:18 ERROR DataSource - Connection refused Unable to acquire JDBC Connection
2024-01-15 10:32:19 INFO  OrderService - Order 4892 processed successfully
2024-01-15 10:32:20 ERROR ApiGateway - java.lang.NullPointerException at OrderController.java:84
2024-01-15 10:32:21 INFO  CacheService - Cache hit rate 94.2%
2024-01-15 10:32:22 ERROR HttpClient - Read timed out after 30000ms connecting to payment-service
2024-01-15 10:32:23 INFO  MetricsService - CPU 67% Memory 4.2GB/8GB
2024-01-15 10:32:24 FATAL AppContext - StackOverflowError at RecursiveProcessor.java:42`

export default function Dashboard() {
  const [logInput,   setLogInput]   = useState('')
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef(null)
  const { addLogs, addAnomalies, setStats, setLoading, isLoading, clearAll } = useLogStore()

  const handleAnalyze = async () => {
    const lines = logInput.split('\n').map(l => l.trim()).filter(Boolean)
    if (!lines.length) return
    setLoading(true)
    try {
      const { data } = await ingestLogs(lines)
      addLogs(data.anomalies || [])
      addAnomalies(data.anomalies || [])
      const statsRes = await fetchStats()
      setStats(statsRes.data)
    } catch (err) {
      console.error('Ingest failed:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (file) => {
    if (!file) return
    setLoading(true)
    try {
      const { data } = await uploadLogFile(file)
      addLogs(data.anomalies || [])
      addAnomalies(data.anomalies || [])
      const statsRes = await fetchStats()
      setStats(statsRes.data)
    } catch (err) {
      console.error('Upload failed:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>

      {/* Input Area */}
      <div style={{
        display: 'flex', alignItems: 'stretch', gap: '0',
        borderBottom: '1px solid #1e2530',
        background: '#0f1218',
      }}>

        {/* File Drop */}
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true) }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setIsDragOver(false); handleFileUpload(e.dataTransfer.files[0]) }}
          style={{
            width: '200px', flexShrink: 0,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            gap: '8px', padding: '24px 16px',
            borderRight: '1px solid #1e2530',
            borderRadius: '0',
            background: isDragOver ? 'rgba(0,212,255,0.04)' : 'transparent',
            cursor: 'pointer', transition: 'all 0.2s',
            border: isDragOver ? '1px dashed #00d4ff' : '1px dashed transparent',
          }}
        >
          <input ref={fileInputRef} type="file" accept=".log,.txt" style={{ display: 'none' }}
            onChange={(e) => handleFileUpload(e.target.files[0])}
          />
          <div style={{
            width: '48px', height: '48px', borderRadius: '12px',
            background: '#141820', border: '1px solid #252d3a',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <FolderOpen size={22} color={isDragOver ? '#00d4ff' : '#4a5568'} />
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '12px', color: '#8892a4', fontWeight: 500 }}>
              Drop log file
            </div>
            <div style={{ fontSize: '10px', color: '#4a5568', fontFamily: 'monospace', marginTop: '2px' }}>
              .log / .txt
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={{
          display: 'flex', alignItems: 'center', padding: '0 16px',
          fontSize: '11px', color: '#4a5568', fontFamily: 'monospace',
        }}>
          OR
        </div>

        {/* Paste Area */}
        <div style={{ flex: 1, padding: '20px 20px 20px 0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <textarea
            value={logInput}
            onChange={(e) => setLogInput(e.target.value)}
            placeholder="Paste log lines here...&#10;2024-01-15 10:32:15 ERROR OutOfMemoryError: Java heap space"
            rows={4}
            style={{
              width: '100%', padding: '12px 14px',
              background: '#141820', border: '1px solid #252d3a',
              borderRadius: '10px', color: '#e2e8f0',
              fontFamily: 'JetBrains Mono, monospace', fontSize: '12px',
              resize: 'none', outline: 'none',
              transition: 'border-color 0.2s', lineHeight: 1.6,
            }}
            onFocus={(e) => e.target.style.borderColor = '#00d4ff'}
            onBlur={(e)  => e.target.style.borderColor = '#252d3a'}
          />

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button onClick={handleAnalyze} disabled={isLoading} className="btn-primary">
              <Search size={14} />
              {isLoading ? 'Analyzing...' : 'Analyze Logs'}
            </button>

            <button onClick={() => setLogInput(SAMPLE_LOGS)} className="btn-ghost">
              <FileText size={14} />
              Load Samples
            </button>

            <button
              onClick={() => { clearAll(); setLogInput('') }}
              className="btn-ghost"
              style={{ marginLeft: 'auto' }}
            >
              <Trash2 size={14} />
              Clear All
            </button>
          </div>
        </div>
      </div>

      {/* Loading Bar */}
      {isLoading && <div className="loading-bar" />}

      {/* Stats */}
      <StatsBar />

      {/* Logs */}
      <LogStream />
    </div>
  )
}