import { useEffect } from 'react'
import useLogStore from '../store/useLogStore'

// ──────────────────────────────────────────
// Severity color map
// ──────────────────────────────────────────
const severityColors = {
  CRITICAL: { border: 'var(--critical)', bg: 'rgba(255,59,59,0.08)',  text: 'var(--critical)', icon: '���' },
  HIGH:     { border: 'var(--high)',     bg: 'rgba(255,140,0,0.08)',  text: 'var(--high)',     icon: '���' },
  MEDIUM:   { border: 'var(--medium)',   bg: 'rgba(255,215,0,0.08)',  text: 'var(--medium)',   icon: '���' },
  LOW:      { border: 'var(--low)',      bg: 'rgba(74,222,128,0.08)', text: 'var(--low)',      icon: '���' },
}

// ──────────────────────────────────────────
// Single Toast Component
// Auto-dismisses after 6 seconds
// ──────────────────────────────────────────
function Toast({ alert }) {
  const { removeAlert } = useLogStore()
  const colors = severityColors[alert.severity] || severityColors.LOW

  // Auto remove after 6 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      removeAlert(alert.id)
    }, 6000)
    return () => clearTimeout(timer)
  }, [alert.id, removeAlert])

  return (
    <div
      className="rounded-xl p-4 border animate-slide-in"
      style={{
        background:   colors.bg,
        borderColor:  colors.border,
        boxShadow:    `0 4px 24px rgba(0,0,0,0.3)`,
        minWidth:     '320px',
        maxWidth:     '380px',
      }}
    >

      {/* ── Toast Header ── */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-xs font-bold tracking-widest"
          style={{ color: colors.text, fontFamily: 'var(--mono)' }}
        >
          <span>{colors.icon}</span>
          <span>{alert.anomalyType}</span>
          <span>—</span>
          <span>{alert.severity}</span>
        </div>

        {/* Close Button */}
        <button
          onClick={() => removeAlert(alert.id)}
          className="text-xs w-5 h-5 flex items-center justify-center rounded"
          style={{
            color:      'var(--text3)',
            background: 'transparent',
            border:     'none',
            cursor:     'pointer',
          }}
        >
          ✕
        </button>
      </div>

      {/* ── Explanation ── */}
      <div className="text-xs leading-relaxed"
        style={{ color: 'var(--text2)' }}
      >
        {alert.explanation || alert.rawLog?.slice(0, 100) || 'Anomaly detected'}
      </div>

      {/* ── Progress Bar (shrinks over 6 seconds) ── */}
      <div className="mt-3 h-0.5 rounded-full overflow-hidden"
        style={{ background: 'var(--border2)' }}
      >
        <div
          className="h-full rounded-full"
          style={{
            background: colors.border,
            animation:  'shrink 6s linear forwards',
            width:      '100%',
          }}
        />
      </div>

    </div>
  )
}

// ──────────────────────────────────────────
// Alert Container
// Renders all active toasts
// Fixed position — top right corner
// ──────────────────────────────────────────
export default function AlertToast() {
  const { alerts } = useLogStore()

  if (alerts.length === 0) return null

  return (
    <>
      {/* Progress bar shrink animation */}
      <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to   { width: 0%; }
        }
      `}</style>

      <div className="fixed top-20 right-5 z-50 flex flex-col gap-2">
        {alerts.map((alert) => (
          <Toast key={alert.id} alert={alert} />
        ))}
      </div>
    </>
  )
}
