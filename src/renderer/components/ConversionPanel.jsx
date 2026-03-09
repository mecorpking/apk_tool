import React from 'react'

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

export default function ConversionPanel({ selectedFile, javaAvailable, converting, progress, result, error, onConvert, onReveal }) {
  const canConvert = selectedFile && javaAvailable && !converting

  return (
    <div className="conversion-panel">
      <button
        className="btn-convert"
        disabled={!canConvert}
        onClick={onConvert}
      >
        {converting ? (
          <><span className="spinner" /> Converting...</>
        ) : (
          'Convert to APK'
        )}
      </button>

      {converting && (
        <div className="progress-container">
          <div className="progress-bar-wrapper">
            <div className="progress-bar" style={{ width: `${progress.percent}%` }} />
          </div>
          <div className="progress-text">{progress.message || 'Preparing...'}</div>
        </div>
      )}

      {result && (
        <div className="result">
          <div className="result-icon">&#9989;</div>
          <div className="result-details">
            <div className="result-path">{result.apkPath.split('/').pop().split('\\').pop()}</div>
            <div className="result-size">{formatSize(result.size)}</div>
          </div>
          <button className="btn-reveal" onClick={onReveal}>
            Show in Folder
          </button>
        </div>
      )}

      {error && (
        <div className="error-message">{error}</div>
      )}
    </div>
  )
}
