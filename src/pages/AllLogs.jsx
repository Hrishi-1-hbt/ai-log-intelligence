import { useState } from 'react'
import { ScrollText, Search, AlertTriangle } from 'lucide-react'
import useLogStore from '../store/useLogStore'

const formatTime = (ts) => {
  if (!ts) return ''
  const d = new Date(ts)
  return isNaN(d) ? '' : d.toLocaleTimeString()
}

const LEVEL_FILTERS = ['ALL', 'FATAL', 'ERROR', 'WARN', 'INFO', 'DEBUG']

const levelStyle = (level) => {
  const map = {
    FATAL: { bg: 'rgba(255,59,59,0.25)', color: '#ff3b3b' },
    ERROR: { bg: 'rgba(255,59,59,0.15)', color: '#ff3b3b' },
    WARN:  { bg: 'rgba(255,140,0,0.15)', color: '#ff8c00' },
    INFO:  { bg: 'rgba(0,212,255,0.12)', color: '#00d4ff' },
    DEBUG: { bg: 'rgba(74,222,128,0.12)',color: '#4ade80' },
  }
  return map[level] || map.INFO
}

export default function AllLogs() {
  const { logs } = useLogStore()
  const [levelFilter, setLevelFilter] = useState('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [showAnomaly, setShowAnomaly] = useState(false)

  const filtered = logs.filter((log) => {
    const matchLevel   = levelFilter === 'ALL' || log.level === levelFilter
    const matchAnomaly = !showAnomaly || log.isAnomaly === true
    const matchSearch  = searchQuery === ''
      || log.rawLog?.toLowerCase().includes(searchQuery.toLowerCase())
      || log.source?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchLevel && matchAnomaly && matchSearch
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>

      {/* Page Header */}
      <div style={{
        padding: '20px 28px',
        background: '#0f1218',
        borderBottom: '1px solid #1e2530',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <h1 style={{
              fontSize: '16px', fontWeight: 600, color: '#e2e8f0',
              display: 'flex', alignItems: 'center', gap: '8px',
            }}>
              <ScrollText size={18} color="#00d4ff" />
              All Logs
            </h1>
            <p style={{ fontSize: '11px', color: '#4a5568', fontFamily: 'monospace', marginTop: '4px' }}>
              {logs.length} total logs in this session
            </p>
          </div>

          {/* Count Badge */}
          <div style={{
            padding: '8px 16px', borderRadius: '8px',
            background: 'rgba(0,212,255,0.08)',
            border: '1px solid rgba(0,212,255,0.2)',
            color: '#00d4ff', fontSize: '13px',
            fontWeight: 700, fontFamily: 'monospace',
          }}>
            {filtered.length} / {logs.length}
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>

          {/* Search */}
          <div style={{ position: 'relative' }}>
            <Search size={13} color="#4a5568" style={{
              position: 'absolute', left: '10px',
              top: '50%', transform: 'translateY(-50%)',
            }} />
            <input
              type="text"
              placeholder="Search logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                paddingLeft: '30px', paddingRight: '12px',
                paddingTop: '8px', paddingBottom: '8px',
                background: '#141820', border: '1px solid #252d3a',
                borderRadius: '8px', color: '#e2e8f0',
                fontFamily: 'monospace', fontSize: '12px',
                outline: 'none', minWidth: '220px',
              }}
              onFocus={(e) => e.target.style.borderColor = '#00d4ff'}
              onBlur={(e)  => e.target.style.borderColor = '#252d3a'}
            />
          </div>

          {/* Level Buttons */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {LEVEL_FILTERS.map((lvl) => {
              const s = lvl === 'ALL' ? null : levelStyle(lvl)
              const active = levelFilter === lvl
              return (
                <button key={lvl} onClick={() => setLevelFilter(lvl)}
                  style={{
                    padding: '7px 14px', borderRadius: '8px',
                    fontSize: '11px', fontWeight: 700,
                    fontFamily: 'monospace', letterSpacing: '0.5px',
                    cursor: 'pointer', transition: 'all 0.15s',
                    background:  active ? (s ? s.bg : 'rgba(0,212,255,0.15)') : 'transparent',
                    border:      `1px solid ${active ? (s ? s.color : '#00d4ff') : '#252d3a'}`,
                    color:       active ? (s ? s.color : '#00d4ff') : '#4a5568',
                  }}
                >
                  {lvl}
                </button>
              )
            })}
          </div>

          {/* Anomalies Only Toggle */}
          <button
            onClick={() => setShowAnomaly(!showAnomaly)}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '7px 14px', borderRadius: '8px',
              fontSize: '11px', fontWeight: 600,
              fontFamily: 'monospace', cursor: 'pointer',
              transition: 'all 0.15s', marginLeft: 'auto',
              background:  showAnomaly ? 'rgba(255,59,59,0.1)'  : 'transparent',
              border:      `1px solid ${showAnomaly ? '#ff3b3b' : '#252d3a'}`,
              color:       showAnomaly ? '#ff3b3b' : '#4a5568',
            }}
          >
            <AlertTriangle size={12} />
            Anomalies Only
          </button>
        </div>
      </div>

      {/* Log Table */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {filtered.length === 0 ? (
          <div style={{
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            height: '280px', gap: '12px', color: '#4a5568',
          }}>
            <ScrollText size={40} color="#252d3a" />
            <div style={{ fontSize: '13px' }}>
              {logs.length === 0
                ? 'No logs yet — go to Dashboard and analyze some logs'
                : 'No logs match your current filters'}
            </div>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>

            {/* Header */}
            <thead style={{ position: 'sticky', top: 0, background: '#0f1218', zIndex: 1 }}>
              <tr style={{ borderBottom: '1px solid #1e2530' }}>
                {['LEVEL', 'SOURCE', 'LOG MESSAGE', 'TYPE', 'TIME'].map((h) => (
                  <th key={h} style={{
                    textAlign: 'left', padding: '12px 16px',
                    fontSize: '10px', fontFamily: 'monospace',
                    color: '#4a5568', letterSpacing: '1.5px',
                    fontWeight: 600, textTransform: 'uppercase',
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            {/* Body */}
            <tbody>
              {filtered.map((log, i) => (
                <tr key={log.id || i} style={{
                  borderBottom: '1px solid #1e2530',
                  background: log.isAnomaly
                    ? 'rgba(255,59,59,0.03)'
                    : i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)',
                  transition: 'background 0.1s',
                }}>

                  {/* Level */}
                  <td style={{ padding: '10px 16px' }}>
                    <span className={`badge-${log.level || 'INFO'}`}>
                      {log.level || 'INFO'}
                    </span>
                  </td>

                  {/* Source */}
                  <td style={{ padding: '10px 16px', color: '#4a5568', fontFamily: 'monospace', fontSize: '11px' }}>
                    {log.source || '—'}
                  </td>

                  {/* Message */}
                  <td style={{ padding: '10px 16px', maxWidth: '400px' }}>
                    <div style={{
                      overflow: 'hidden', textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap', color: '#8892a4',
                      fontFamily: 'monospace', fontSize: '11px',
                    }}>
                      {log.rawLog || ''}
                    </div>
                  </td>

                  {/* Anomaly Type */}
                  <td style={{ padding: '10px 16px' }}>
                    {log.isAnomaly ? (
                      <span style={{
                        fontSize: '10px', fontFamily: 'monospace',
                        padding: '3px 8px', borderRadius: '4px',
                        background: 'rgba(255,59,59,0.1)',
                        border: '1px solid rgba(255,59,59,0.2)',
                        color: '#ff3b3b', fontWeight: 600,
                      }}>
                        {log.anomalyType}
                      </span>
                    ) : (
                      <span style={{ color: '#252d3a' }}>—</span>
                    )}
                  </td>

                  {/* Time */}
                  <td style={{ padding: '10px 16px', color: '#4a5568', fontFamily: 'monospace', fontSize: '11px' }}>
                    {formatTime(log.timestamp)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}