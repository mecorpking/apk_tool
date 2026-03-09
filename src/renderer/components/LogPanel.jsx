import React, { useState, useEffect, useRef } from 'react'

export default function LogPanel({ logs, onClear }) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef(null)

  // Auto-open when logs appear
  useEffect(() => {
    if (logs.length > 0 && !open) {
      setOpen(true)
    }
  }, [logs.length])

  // Auto-scroll to bottom
  useEffect(() => {
    if (containerRef.current && open) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [logs, open])

  return (
    <div className="log-section">
      <div className="log-toggle" onClick={() => setOpen(!open)}>
        <h3>
          <span className={`log-toggle-arrow ${open ? 'open' : ''}`}>&#9654;</span>
          Output Log {logs.length > 0 && `(${logs.length})`}
        </h3>
        {open && logs.length > 0 && (
          <button
            className="btn-clear-log"
            onClick={(e) => { e.stopPropagation(); onClear() }}
          >
            Clear
          </button>
        )}
      </div>

      {open && (
        <div className="log-container" ref={containerRef}>
          {logs.length === 0 ? (
            <div className="log-entry">
              <span className="log-message" style={{ color: 'var(--text-muted)' }}>No output yet.</span>
            </div>
          ) : (
            logs.map((log, i) => (
              <div key={i} className="log-entry">
                <span className="log-time">{log.time}</span>
                <span className={`log-message ${log.level}`}>{log.message}</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
