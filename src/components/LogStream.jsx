import useLogStore from '../store/useLogStore'

const formatTime = (ts) => {
  if (!ts) return ''
  const d = new Date(ts)
  return isNaN(d) ? '' : d.toLocaleTimeString()
}

const severityColor = (sev) => {
  if (sev === 'CRITICAL') return '#ff3b3b'
  if (sev === 'HIGH')     return '#ff8c00'
  if (sev === 'MEDIUM')   return '#ffd700'
  return '#4ade80'
}

function EmptyState({ icon: Icon, message }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      height: '200px', gap: '12px',
      color: '#4a5568', fontSize: '13px',
    }}>
      <Icon size={36} color="#252d3a" />
      <span>{message}</span>
    </div>
  )
}

export default function LogStream() {
  const { logs, anomalies } = useLogStore()

  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '1fr 1fr',
      flex: 1, minHeight: 0,
      gap: '1px', background: '#1e2530',
    }}>

      {/* Left — Log Stream */}
      <div style={{ background: '#0a0c10', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 20px',
          background: '#0f1218',
          borderBottom: '1px solid #1e2530',
        }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#e2e8f0' }}>
            Recent Log Stream
          </span>
          <span style={{ fontSize: '11px', color: '#4a5568', fontFamily: 'monospace' }}>
            {logs.length} entries
          </span>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
          {logs.length === 0 ? (
            <div style={{
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              height: '200px', gap: '10px',
              color: '#4a5568', fontSize: '13px',
            }}>
              <div style={{ fontSize: '32px', opacity: 0.3 }}>◈</div>
              No logs yet — upload a file or paste logs above
            </div>
          ) : (
            logs.slice(0, 100).map((log, i) => (
              <div key={log.id || i} style={{
                display: 'flex', alignItems: 'flex-start', gap: '10px',
                padding: '8px 10px', borderRadius: '8px', marginBottom: '4px',
                background: log.isAnomaly ? 'rgba(255,59,59,0.04)' : 'transparent',
                border: `1px solid ${log.isAnomaly ? 'rgba(255,59,59,0.15)' : 'transparent'}`,
              }}>
                <span className={`badge-${log.level || 'INFO'}`} style={{ flexShrink: 0, marginTop: '1px' }}>
                  {log.level || 'INFO'}
                </span>
                <span style={{
                  flex: 1, fontSize: '11px', color: '#8892a4',
                  fontFamily: 'monospace', overflow: 'hidden',
                  textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {log.rawLog || ''}
                </span>
                <span style={{ fontSize: '10px', color: '#4a5568', fontFamily: 'monospace', flexShrink: 0 }}>
                  {formatTime(log.timestamp)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right — Anomalies */}
      <div style={{ background: '#0a0c10', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 20px',
          background: '#0f1218',
          borderBottom: '1px solid #1e2530',
        }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#e2e8f0' }}>
            Detected Anomalies
          </span>
          <span style={{ fontSize: '11px', color: '#4a5568', fontFamily: 'monospace' }}>
            {anomalies.length} found
          </span>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
          {anomalies.length === 0 ? (
            <div style={{
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              height: '200px', gap: '10px',
              color: '#4a5568', fontSize: '13px',
            }}>
              <div style={{ fontSize: '32px', opacity: 0.3 }}>◈</div>
              No anomalies detected yet
            </div>
          ) : (
            anomalies.slice(0, 50).map((a, i) => (
              <div key={a.id || i} style={{
                padding: '12px 14px', borderRadius: '10px', marginBottom: '8px',
                background: '#0f1218',
                border: '1px solid #1e2530',
                borderLeft: `3px solid ${severityColor(a.severity)}`,
              }}>
                <div style={{
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'space-between', marginBottom: '6px',
                }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#e2e8f0', fontFamily: 'monospace' }}>
                    {a.anomalyType}
                  </span>
                  <span style={{
                    fontSize: '10px', fontFamily: 'monospace', fontWeight: 700,
                    padding: '2px 8px', borderRadius: '4px',
                    background: `${severityColor(a.severity)}20`,
                    color: severityColor(a.severity),
                  }}>
                    {a.severity}
                  </span>
                </div>
                <div style={{ fontSize: '11px', color: '#8892a4', lineHeight: 1.5 }}>
                  {(a.explanation || a.rawLog || '').slice(0, 100)}
                  {(a.explanation || '').length > 100 ? '...' : ''}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}