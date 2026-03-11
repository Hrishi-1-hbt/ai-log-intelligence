import { Brain } from 'lucide-react'
import useLogStore from '../store/useLogStore'

export default function Header() {
  const { isConnected, stats, setActiveTab } = useLogStore()

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 32px',
      height: '64px',
      background: 'rgba(10,12,16,0.97)',
      borderBottom: '1px solid #1e2530',
      backdropFilter: 'blur(12px)',
    }}>

      {/* Logo — clicks back to dashboard */}
      <div
        onClick={() => setActiveTab('dashboard')}
        style={{
          display: 'flex', alignItems: 'center', gap: '12px',
          cursor: 'pointer',
        }}
      >
        <div style={{
          width: '38px', height: '38px',
          background: 'linear-gradient(135deg, #00d4ff, #0066ff)',
          borderRadius: '10px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'transform 0.15s',
        }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <Brain size={20} color="#000" />
        </div>
        <div>
          <div style={{ fontSize: '15px', fontWeight: 600, color: '#e2e8f0', letterSpacing: '0.3px' }}>
            Log Intelligence Engine
          </div>
          <div style={{ fontSize: '10px', color: '#4a5568', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '2px', textTransform: 'uppercase' }}>
            AI-Powered Anomaly Detection
          </div>
        </div>
      </div>

      {/* Right */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '11px', color: '#4a5568', fontFamily: 'monospace' }}>LOGS</span>
          <span style={{ fontSize: '15px', fontWeight: 700, color: '#00d4ff', fontFamily: 'monospace' }}>{stats.totalLogs}</span>
        </div>

        <div style={{ width: '1px', height: '20px', background: '#1e2530' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '11px', color: '#4a5568', fontFamily: 'monospace' }}>ANOMALIES</span>
          <span style={{ fontSize: '15px', fontWeight: 700, color: '#ff3b3b', fontFamily: 'monospace' }}>{stats.totalAnomalies}</span>
        </div>

        <div style={{ width: '1px', height: '20px', background: '#1e2530' }} />

        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '6px 14px', borderRadius: '8px',
          border: `1px solid ${isConnected ? 'rgba(74,222,128,0.3)' : '#252d3a'}`,
          background: isConnected ? 'rgba(74,222,128,0.06)' : 'transparent',
        }}>
          <div style={{
            width: '7px', height: '7px', borderRadius: '50%',
            background: isConnected ? '#4ade80' : '#4a5568',
            boxShadow: isConnected ? '0 0 8px #4ade80' : 'none',
            animation: isConnected ? 'pulse-dot 2s infinite' : 'none',
          }} />
          <span style={{
            fontSize: '11px', fontWeight: 600,
            fontFamily: 'monospace', letterSpacing: '1px',
            color: isConnected ? '#4ade80' : '#4a5568',
          }}>
            {isConnected ? 'LIVE' : 'OFFLINE'}
          </span>
        </div>
      </div>
    </header>
  )
}