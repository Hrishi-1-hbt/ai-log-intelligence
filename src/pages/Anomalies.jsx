import { useState } from 'react'
import { AlertTriangle, Search, X, Download } from 'lucide-react'
import AnomalyCard from '../components/AnomalyCard'
import useLogStore from '../store/useLogStore'
import jsPDF from 'jspdf'

const SEVERITY_FILTERS = ['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW']

const severityColor = (sev) => {
  if (sev === 'ALL')      return '#00d4ff'
  if (sev === 'CRITICAL') return '#ff3b3b'
  if (sev === 'HIGH')     return '#ff8c00'
  if (sev === 'MEDIUM')   return '#ffd700'
  if (sev === 'LOW')      return '#4ade80'
  return '#8892a4'
}

const severityBg = (sev) => {
  if (sev === 'ALL')      return 'rgba(0,212,255,0.15)'
  if (sev === 'CRITICAL') return 'rgba(255,59,59,0.15)'
  if (sev === 'HIGH')     return 'rgba(255,140,0,0.15)'
  if (sev === 'MEDIUM')   return 'rgba(255,215,0,0.15)'
  if (sev === 'LOW')      return 'rgba(74,222,128,0.15)'
  return 'transparent'
}

export default function Anomalies() {
  const { anomalies } = useLogStore()
  const [severityFilter, setSeverityFilter] = useState('ALL')
  const [searchQuery,    setSearchQuery]    = useState('')

  const filtered = anomalies.filter((a) => {
    const matchSeverity = severityFilter === 'ALL' || a.severity === severityFilter
    const matchSearch   = searchQuery === ''
      || a.anomalyType?.toLowerCase().includes(searchQuery.toLowerCase())
      || a.rawLog?.toLowerCase().includes(searchQuery.toLowerCase())
      || a.explanation?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchSeverity && matchSearch
  })

  // ──────────────────────────────────────────
  // Download PDF Report
  // ──────────────────────────────────────────
  const downloadPDF = () => {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()

    // Title
    doc.setFontSize(20)
    doc.setTextColor(0, 212, 255)
    doc.text('AI Log Intelligence Report', 20, 20)

    // Subtitle
    doc.setFontSize(10)
    doc.setTextColor(150, 150, 150)
    doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 30)
    doc.text(`Total Anomalies: ${filtered.length}`, 20, 38)

    // Divider
    doc.setDrawColor(30, 37, 48)
    doc.line(20, 44, pageWidth - 20, 44)

    let y = 54

    filtered.forEach((anomaly, index) => {
      // Check page overflow
      if (y > 260) {
        doc.addPage()
        y = 20
      }

      // Anomaly number + type
      doc.setFontSize(12)
      doc.setTextColor(226, 232, 240)
      doc.text(`${index + 1}. ${anomaly.anomalyType || 'UNKNOWN'}`, 20, y)

      // Severity badge
      doc.setFontSize(9)
      const sev = anomaly.severity || 'LOW'
      if (sev === 'CRITICAL') doc.setTextColor(255, 59, 59)
      else if (sev === 'HIGH') doc.setTextColor(255, 140, 0)
      else if (sev === 'MEDIUM') doc.setTextColor(255, 215, 0)
      else doc.setTextColor(74, 222, 128)
      doc.text(`[${sev}]`, pageWidth - 40, y)

      y += 8

      // Explanation
      if (anomaly.explanation) {
        doc.setFontSize(9)
        doc.setTextColor(136, 146, 164)
        const lines = doc.splitTextToSize(`Explanation: ${anomaly.explanation}`, pageWidth - 40)
        doc.text(lines, 20, y)
        y += lines.length * 5 + 2
      }

      // Root Cause
      if (anomaly.rootCause) {
        doc.setFontSize(9)
        doc.setTextColor(136, 146, 164)
        const lines = doc.splitTextToSize(`Root Cause: ${anomaly.rootCause}`, pageWidth - 40)
        doc.text(lines, 20, y)
        y += lines.length * 5 + 2
      }

      // Raw Log
      doc.setFontSize(8)
      doc.setTextColor(74, 85, 104)
      const logLines = doc.splitTextToSize(`Log: ${anomaly.rawLog || ''}`, pageWidth - 40)
      doc.text(logLines, 20, y)
      y += logLines.length * 4 + 2

      // Divider between anomalies
      doc.setDrawColor(30, 37, 48)
      doc.line(20, y, pageWidth - 20, y)
      y += 8
    })

    // Save
    doc.save(`anomaly-report-${new Date().toISOString().slice(0,10)}.pdf`)
  }

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
              fontSize: '16px', fontWeight: 600,
              color: '#e2e8f0', display: 'flex',
              alignItems: 'center', gap: '8px',
            }}>
              <AlertTriangle size={18} color="#ff3b3b" />
              Anomaly Explorer
            </h1>
            <p style={{ fontSize: '11px', color: '#4a5568', fontFamily: 'monospace', marginTop: '4px' }}>
              {anomalies.length} total anomalies — click any card to expand AI analysis
            </p>
          </div>

          {/* Right side — count + download */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>

            {/* Count Badge */}
            <div style={{
              padding: '8px 16px', borderRadius: '8px',
              background: 'rgba(255,59,59,0.08)',
              border: '1px solid rgba(255,59,59,0.2)',
              color: '#ff3b3b', fontSize: '13px',
              fontWeight: 700, fontFamily: 'monospace',
            }}>
              {filtered.length} / {anomalies.length}
            </div>

            {/* Download PDF Button */}
            {filtered.length > 0 && (
              <button
                onClick={downloadPDF}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '8px 16px', borderRadius: '8px',
                  background: 'linear-gradient(135deg, #00d4ff, #0066ff)',
                  border: 'none', color: '#000',
                  fontSize: '12px', fontWeight: 600,
                  cursor: 'pointer', transition: 'all 0.15s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.filter = 'brightness(1.1)'}
                onMouseLeave={(e) => e.currentTarget.style.filter = 'brightness(1)'}
              >
                <Download size={14} />
                Download PDF
              </button>
            )}
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
              placeholder="Search anomalies..."
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

          {/* Severity Buttons */}
          <div style={{ display: 'flex', gap: '8px' }}>
            {SEVERITY_FILTERS.map((sev) => (
              <button
                key={sev}
                onClick={() => setSeverityFilter(sev)}
                style={{
                  padding: '7px 14px', borderRadius: '8px',
                  fontSize: '11px', fontWeight: 700,
                  fontFamily: 'monospace', letterSpacing: '0.5px',
                  cursor: 'pointer', transition: 'all 0.15s',
                  background:  severityFilter === sev ? severityBg(sev)       : 'transparent',
                  border:      `1px solid ${severityFilter === sev ? severityColor(sev) : '#252d3a'}`,
                  color:       severityFilter === sev ? severityColor(sev)     : '#4a5568',
                }}
              >
                {sev}
              </button>
            ))}
          </div>

          {/* Clear filters */}
          {(searchQuery || severityFilter !== 'ALL') && (
            <button
              onClick={() => { setSeverityFilter('ALL'); setSearchQuery('') }}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '7px 12px', borderRadius: '8px',
                fontSize: '11px', fontFamily: 'monospace',
                background: 'transparent',
                border: '1px solid #252d3a',
                color: '#8892a4', cursor: 'pointer',
                marginLeft: 'auto',
              }}
            >
              <X size={12} />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Anomaly List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
        {filtered.length === 0 ? (
          <div style={{
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            height: '280px', gap: '12px', color: '#4a5568',
          }}>
            <AlertTriangle size={40} color="#252d3a" />
            <div style={{ fontSize: '13px' }}>
              {anomalies.length === 0
                ? 'No anomalies detected yet — analyze some logs first'
                : 'No anomalies match your current filters'}
            </div>
            {anomalies.length > 0 && (
              <button
                onClick={() => { setSeverityFilter('ALL'); setSearchQuery('') }}
                style={{
                  padding: '8px 16px', borderRadius: '8px',
                  fontSize: '12px', background: 'transparent',
                  border: '1px solid #252d3a', color: '#8892a4',
                  cursor: 'pointer', marginTop: '4px',
                }}
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div style={{ maxWidth: '860px' }}>
            {filtered.map((anomaly, i) => (
              <AnomalyCard key={anomaly.id || i} anomaly={anomaly} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
