import React from 'react'

export default function Header({ javaStatus }) {
  const dotClass = javaStatus.checking ? 'yellow' : javaStatus.available ? 'green' : 'red'
  const statusText = javaStatus.checking
    ? 'Checking Java...'
    : javaStatus.available
      ? `Java ${javaStatus.version}`
      : 'Java not found'

  return (
    <div className="header">
      <div className="header-left">
        <div className="header-icon">
          <span role="img" aria-label="apk">&#9881;</span>
        </div>
        <div>
          <h1>APK Tool</h1>
          <div className="header-subtitle">AAB to APK Converter</div>
        </div>
      </div>
      <div className="java-status">
        <span className={`dot ${dotClass}`} />
        <span>{statusText}</span>
        {!javaStatus.checking && !javaStatus.available && (
          <a className="java-link" href="https://adoptium.net/" target="_blank" rel="noreferrer">
            Install
          </a>
        )}
      </div>
    </div>
  )
}
