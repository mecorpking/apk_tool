import React, { useState, useCallback } from 'react'

function ApkSelector({ installApkPath, onSelectApk, onDropApk }) {
  const [dragover, setDragover] = useState(false)

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragover(true)
  }, [])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragover(false)
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragover(false)
    const files = e.dataTransfer.files
    if (files.length > 0) {
      onDropApk(files[0].path)
    }
  }, [onDropApk])

  if (installApkPath) {
    const fileName = installApkPath.split('/').pop().split('\\').pop()
    return (
      <div className="apk-selector has-file">
        <div className="apk-selector-info">
          <div className="apk-selector-icon">&#128230;</div>
          <div className="apk-selector-details">
            <div className="apk-selector-label">APK to install</div>
            <div className="apk-selector-name">{fileName}</div>
          </div>
          <button className="btn-change" onClick={onSelectApk}>Change</button>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`apk-selector empty ${dragover ? 'dragover' : ''}`}
      onClick={onSelectApk}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="apk-selector-icon">&#128230;</div>
      <div className="apk-selector-text">Select or drop an APK file to install</div>
      <div className="apk-selector-hint">Or convert an AAB in the Convert tab</div>
    </div>
  )
}

export default function DeviceList({ devices, refreshing, installApkPath, installStates, onInstall, onRefresh, onSelectApk, onDropApk }) {
  return (
    <div className="install-tab">
      <ApkSelector
        installApkPath={installApkPath}
        onSelectApk={onSelectApk}
        onDropApk={onDropApk}
      />

      <div className="device-section">
        <div className="device-header">
          <h2>
            Connected Devices
            {devices.length > 0 && <span className="device-count">{devices.length}</span>}
          </h2>
          <button
            className={`btn-refresh ${refreshing ? 'spinning' : ''}`}
            onClick={onRefresh}
            disabled={refreshing}
            title="Refresh device list"
          >
            &#8635;{refreshing ? ' Refreshing...' : ' Refresh'}
          </button>
        </div>

        {devices.length === 0 ? (
          <div className="no-devices">
            <div className="no-devices-icon">&#128268;</div>
            <div>No Android devices detected</div>
            <div className="no-devices-hint">Connect a device via USB and enable USB debugging, then click Refresh.</div>
          </div>
        ) : (
          <div className="device-list">
            {devices.map((device) => {
              const state = installStates[device.serial] || {}
              const isConnected = device.status === 'device'
              const canInstall = isConnected && installApkPath && !state.installing

              let statusClass = 'offline'
              if (device.status === 'device') statusClass = 'connected'
              else if (device.status === 'unauthorized') statusClass = 'unauthorized'

              return (
                <div key={device.serial} className="device-card">
                  <div className="device-icon">&#128241;</div>
                  <div className="device-info">
                    <div className="device-model">{device.model}</div>
                    <div className="device-serial">{device.serial}</div>
                    {device.status === 'unauthorized' && (
                      <div className="device-hint">Accept USB debugging prompt on device</div>
                    )}
                    {state.result && (
                      <div className={`install-result ${state.result.success ? 'success' : 'error'}`}>
                        {state.result.message}
                      </div>
                    )}
                  </div>
                  <span className={`device-status ${statusClass}`}>
                    {device.status === 'device' ? 'Connected' : device.status}
                  </span>
                  <button
                    className={`btn-install ${state.installing ? 'installing' : ''}`}
                    disabled={!canInstall}
                    onClick={() => onInstall(device.serial)}
                  >
                    {state.installing ? (
                      <><span className="spinner" /> Installing</>
                    ) : (
                      'Install'
                    )}
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
