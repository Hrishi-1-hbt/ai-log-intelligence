import { useState } from 'react'

// ──────────────────────────────────────────
// Severity color map
// ──────────────────────────────────────────
const severityColors = {
  CRITICAL: { border: 'var(--critical)', badge: 'rgba(255,59,59,0.2)',  text: 'var(--critical)' },
  HIGH:     { border: 'var(--high)',     badge: 'rgba(255,140,0,0.2)',  text: 'var(--high)'     },
  MEDIUM:   { border: 'var(--medium)',   badge: 'rgba(255,215,0,0.2)',  text: 'var(--medium)'   },
  LOW:      { border: 'var(--low)',      badge: 'rgba(74,222,128,0.15)',text: 'var(--low)'      },
  NONE:     { border: 'var(--border2)',  badge: 'rgba(74,85,104,0.2)',  text: 'var(--text3)'    },
}

// ──────────────────────────────────────────
// Format timestamp
// ──────────────────────────────────────────
const formatTime = (ts) => {
  if (!ts) return ''
  const d = new Date(ts)
  return isNaN(d) ? '' : d.toLocaleTimeString()
}

export default function AnomalyCard({ anomaly }) {
  const [expanded, setExpanded] = useState(false)

  const sev    = anomaly.severity || 'LOW'
  const colors = severityColors[sev] || severityColors.LOW

  return (
    <div
      onClick={() => setExpanded(!expanded)}
      className="rounded-xl p-4 mb-3 border-l-4 border cursor-pointer transition-all duration-150 animate-fade-in"
      style={{
        background:       'var(--bg2)',
        borderColor:      'var(--border2)',
        borderLeftColor:  colors.border,
      }}
    >

      {/* ── Card Header ── */}
      <div className="flex items-center justify-between mb-2">

        {/* Anomaly Type */}
        <span className="text-sm font-semibold tracking-wide"
          style={{ color: 'var(--text)', fontFamily: 'var(--mono)' }}
        >
          {anomaly.anomalyType || 'UNKNOWN'}
        </span>

        <div className="flex items-center gap-2">

          {/* Timestamp */}
          <span className="text-xs"
            style={{ color: 'var(--text3)', fontFamily: 'var(--mono)' }}
          >
            {formatTime(anomaly.timestamp || anomaly.detectedAt)}
          </span>

          {/* Severity Badge */}
          <span className="text-xs font-bold px-2 py-0.5 rounded tracking-widest"
            style={{
              background: colors.badge,
              color:      colors.text,
              fontFamily: 'var(--mono)',
            }}
          >
            {sev}
          </span>

          {/* Expand Arrow */}
          <span className="text-xs transition-transform duration-200"
            style={{
              color:     'var(--text3)',
              transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
              display:   'inline-block',
            }}
          >
            ▼
          </span>

        </div>
      </div>

      {/* ── Explanation ── */}
      <div className="text-sm mb-3 leading-relaxed"
        style={{ color: 'var(--text2)' }}
      >
        {anomaly.explanation || 'Analyzing with AI...'}
      </div>

      {/* ── Raw Log ── */}
      <div className="text-xs px-3 py-2 rounded-lg border truncate"
        style={{
          background:  'var(--bg)',
          borderColor: 'var(--border)',
          color:       'var(--text3)',
          fontFamily:  'var(--mono)',
        }}
      >
        {anomaly.rawLog || ''}
      </div>

      {/* ── Expanded Section ── */}
      {expanded && (
        <div className="mt-4 pt-4 border-t"
          style={{ borderColor: 'var(--border)' }}
        >

          {/* Root Cause */}
          <div className="mb-3">
            <div className="text-xs uppercase tracking-widest mb-1"
              style={{ color: 'var(--text3)', fontFamily: 'var(--mono)' }}
            >
              Root Cause
            </div>
            <div className="text-sm leading-relaxed"
              style={{ color: 'var(--text2)' }}
            >
              {anomaly.rootCause || '—'}
            </div>
          </div>

          {/* Suggested Fix */}
          <div>
            <div className="text-xs uppercase tracking-widest mb-1"
              style={{ color: 'var(--text3)', fontFamily: 'var(--mono)' }}
            >
              Suggested Fix
            </div>
            <div className="text-sm leading-relaxed whitespace-pre-line"
              style={{ color: 'var(--text2)' }}
            >
              {anomaly.suggestedFix || '—'}
            </div>
          </div>

        </div>
      )}

    </div>
  )
}
