import React from 'react'
import { useApkTool } from './hooks/useApkTool'
import Header from './components/Header'
import FileDropZone from './components/FileDropZone'
import ConversionPanel from './components/ConversionPanel'
import DeviceList from './components/DeviceList'
import LogPanel from './components/LogPanel'

export default function App() {
  const {
    javaStatus,
    activeTab,
    setActiveTab,
    selectedFile,
    converting,
    progress,
    result,
    conversionError,
    installApkPath,
    devices,
    refreshing,
    installStates,
    logs,
    selectFile,
    handleFileDrop,
    convert,
    selectApkForInstall,
    handleApkDrop,
    refreshDevices,
    installToDevice,
    revealApk,
    clearLogs
  } = useApkTool()

  return (
    <div className="app">
      <Header javaStatus={javaStatus} />

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'convert' ? 'active' : ''}`}
          onClick={() => setActiveTab('convert')}
        >
          <span className="tab-icon">&#9881;</span>
          Convert
        </button>
        <button
          className={`tab ${activeTab === 'install' ? 'active' : ''}`}
          onClick={() => setActiveTab('install')}
        >
          <span className="tab-icon">&#128241;</span>
          Install
          {devices.length > 0 && (
            <span className="tab-badge">{devices.length}</span>
          )}
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'convert' && (
          <>
            <FileDropZone
              selectedFile={selectedFile}
              onSelect={selectFile}
              onDrop={handleFileDrop}
            />

            <ConversionPanel
              selectedFile={selectedFile}
              javaAvailable={javaStatus.available}
              converting={converting}
              progress={progress}
              result={result}
              error={conversionError}
              onConvert={convert}
              onReveal={revealApk}
            />
          </>
        )}

        {activeTab === 'install' && (
          <DeviceList
            devices={devices}
            refreshing={refreshing}
            installApkPath={installApkPath}
            installStates={installStates}
            onInstall={installToDevice}
            onRefresh={refreshDevices}
            onSelectApk={selectApkForInstall}
            onDropApk={handleApkDrop}
          />
        )}
      </div>

      <LogPanel logs={logs} onClear={clearLogs} />
    </div>
  )
}
