import { Download, AlertOctagon, TrendingUp, CheckCircle } from 'lucide-react'
import useLogStore from '../store/useLogStore'

const statItems = [
  { icon: Download,     label: 'PROCESSED',   key: 'totalLogs',      color: '#00d4ff'  },
  { icon: AlertOctagon, label: 'ANOMALIES',    key: 'totalAnomalies', color: '#ff3b3b'  },
  { icon: TrendingUp,   label: 'ANOMALY RATE', key: 'anomalyRate',    color: '#ff8c00'  },
  { icon: CheckCircle,  label: 'NORMAL',       key: 'normal',         color: '#4ade80'  },
]

export default function StatsBar() {
  const { stats } = useLogStore()
  const normal = stats.totalLogs - stats.totalAnomalies

  const getValue = (key) => {
    if (key === 'normal') return normal
    return stats[key] ?? 0
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      borderBottom: '1px solid #1e2530',
      background: '#0f1218',
    }}>
      {statItems.map((item, i) => {
        const Icon = item.icon
        return (
          <div key={item.key} style={{
            display: 'flex', alignItems: 'center', gap: '16px',
            padding: '20px 28px',
            borderRight: i < 3 ? '1px solid #1e2530' : 'none',
          }}>
            <div style={{
              width: '46px', height: '46px', flexShrink: 0,
              background: '#141820',
              border: '1px solid #252d3a',
              borderRadius: '12px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon size={20} color={item.color} />
            </div>
            <div>
              <div style={{
                fontSize: '10px', fontFamily: 'monospace',
                color: '#4a5568', letterSpacing: '1.5px',
                textTransform: 'uppercase', marginBottom: '4px',
              }}>
                {item.label}
              </div>
              <div style={{
                fontSize: '24px', fontWeight: 700,
                color: item.color, fontFamily: 'monospace',
                lineHeight: 1,
              }}>
                {getValue(item.key)}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}