import { LayoutDashboard, AlertTriangle, ScrollText, Sparkles } from 'lucide-react'
import useLogStore from '../store/useLogStore'

const navItems = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard'  },
  { id: 'anomalies', icon: AlertTriangle,   label: 'Anomalies'  },
  { id: 'logs',      icon: ScrollText,      label: 'All Logs'   },
  { id: 'summary',   icon: Sparkles,        label: 'AI Summary' },
]

export default function Sidebar() {
  const { activeTab, setActiveTab, stats, anomalies } = useLogStore()

  return (
    <aside style={{
      width: '240px',
      minHeight: 'calc(100vh - 64px)',
      background: '#0f1218',
      borderRight: '1px solid #1e2530',
      display: 'flex',
      flexDirection: 'column',
      padding: '24px 12px',
      gap: '32px',
      flexShrink: 0,
    }}>

      {/* Navigation */}
      <div>
        <div style={{
          fontSize: '10px', fontFamily: 'monospace',
          color: '#4a5568', letterSpacing: '2px',
          textTransform: 'uppercase', padding: '0 10px',
          marginBottom: '10px',
        }}>
          Navigation
        </div>

        {navItems.map((item) => {
          const Icon = item.icon
          const active = activeTab === item.id
          return (
            <button key={item.id} onClick={() => setActiveTab(item.id)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center',
                gap: '10px', padding: '10px 12px',
                borderRadius: '8px', marginBottom: '4px',
                background: active ? 'rgba(0,212,255,0.08)' : 'transparent',
                border: `1px solid ${active ? 'rgba(0,212,255,0.2)' : 'transparent'}`,
                color: active ? '#00d4ff' : '#8892a4',
                fontSize: '13px', fontWeight: 500,
                cursor: 'pointer', textAlign: 'left',
                transition: 'all 0.15s',
              }}
            >
              <Icon size={15} />
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.id === 'anomalies' && anomalies.length > 0 && (
                <span style={{
                  fontSize: '10px', fontFamily: 'monospace',
                  padding: '2px 7px', borderRadius: '10px',
                  background: 'rgba(255,59,59,0.2)',
                  color: '#ff3b3b',
                }}>
                  {anomalies.length}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Stats */}
      <div>
        <div style={{
          fontSize: '10px', fontFamily: 'monospace',
          color: '#4a5568', letterSpacing: '2px',
          textTransform: 'uppercase', padding: '0 10px',
          marginBottom: '10px',
        }}>
          Live Stats
        </div>

        <div style={{
          background: '#141820', border: '1px solid #1e2530',
          borderRadius: '10px', padding: '16px', marginBottom: '10px',
        }}>
          <div style={{ fontSize: '10px', color: '#4a5568', fontFamily: 'monospace', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '6px' }}>
            Total Logs
          </div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#00d4ff', fontFamily: 'monospace' }}>
            {stats.totalLogs}
          </div>
          <div style={{ fontSize: '11px', color: '#4a5568', marginTop: '4px' }}>
            processed this session
          </div>
        </div>

        <div style={{
          background: '#141820', border: '1px solid #1e2530',
          borderRadius: '10px', padding: '16px',
        }}>
          <div style={{ fontSize: '10px', color: '#4a5568', fontFamily: 'monospace', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '6px' }}>
            Anomalies
          </div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#ff3b3b', fontFamily: 'monospace' }}>
            {stats.totalAnomalies}
          </div>
          <div style={{ fontSize: '11px', color: '#4a5568', marginTop: '4px' }}>
            {stats.anomalyRate} anomaly rate
          </div>
        </div>
      </div>

      {/* Severity Guide */}
      <div style={{ marginTop: 'auto' }}>
        <div style={{
          fontSize: '10px', fontFamily: 'monospace',
          color: '#4a5568', letterSpacing: '2px',
          textTransform: 'uppercase', padding: '0 10px',
          marginBottom: '10px',
        }}>
          Severity
        </div>
        {[
          { color: '#ff3b3b', label: 'CRITICAL' },
          { color: '#ff8c00', label: 'HIGH'     },
          { color: '#ffd700', label: 'MEDIUM'   },
          { color: '#4ade80', label: 'LOW'      },
        ].map(s => (
          <div key={s.label} style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '6px 10px', fontSize: '11px',
            color: '#4a5568', fontFamily: 'monospace',
          }}>
            <div style={{
              width: '8px', height: '8px', borderRadius: '50%',
              background: s.color, flexShrink: 0,
              boxShadow: `0 0 6px ${s.color}40`,
            }} />
            {s.label}
          </div>
        ))}
      </div>
    </aside>
  )
}