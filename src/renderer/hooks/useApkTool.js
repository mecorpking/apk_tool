import { useState, useEffect, useCallback, useRef } from 'react'

export function useApkTool() {
  const [javaStatus, setJavaStatus] = useState({ available: false, version: null, checking: true, error: null })
  const [activeTab, setActiveTab] = useState('convert')
  const [selectedFile, setSelectedFile] = useState(null)
  const [converting, setConverting] = useState(false)
  const [progress, setProgress] = useState({ stage: '', message: '', percent: 0 })
  const [result, setResult] = useState(null)
  const [conversionError, setConversionError] = useState(null)
  // Install tab: independent APK path (can be from conversion OR manual pick)
  const [installApkPath, setInstallApkPath] = useState(null)
  const [devices, setDevices] = useState([])
  const [refreshing, setRefreshing] = useState(false)
  const [installStates, setInstallStates] = useState({})
  const [logs, setLogs] = useState([])
  const logRef = useRef(null)

  const addLog = useCallback((message, level = 'info') => {
    const time = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
    setLogs(prev => [...prev, { time, message, level }])
  }, [])

  // Check Java on mount
  useEffect(() => {
    window.apkTool.checkJava().then((status) => {
      setJavaStatus({ ...status, checking: false })
      if (status.available) {
        addLog(`Java detected: ${status.version}`, 'success')
      } else {
        addLog('Java not found. Please install Java JDK 11+.', 'error')
      }
    })
  }, [addLog])

  // Subscribe to device updates and start polling
  useEffect(() => {
    const unsubDevices = window.apkTool.onDevicesUpdated((newDevices) => {
      setDevices(newDevices)
    })
    window.apkTool.startDevicePolling()

    return () => {
      unsubDevices()
      window.apkTool.stopDevicePolling()
    }
  }, [])

  // Subscribe to conversion progress
  useEffect(() => {
    const unsubProgress = window.apkTool.onConversionProgress((data) => {
      setProgress(data)
      if (data.message) addLog(data.message)
    })

    return () => unsubProgress()
  }, [addLog])

  // Subscribe to install progress
  useEffect(() => {
    const unsubInstall = window.apkTool.onInstallProgress((data) => {
      if (data.message) addLog(`[${data.serial}] ${data.message}`)
    })

    return () => unsubInstall()
  }, [addLog])

  // When conversion produces an APK, auto-set it as install target
  useEffect(() => {
    if (result?.apkPath) {
      setInstallApkPath(result.apkPath)
    }
  }, [result])

  const selectFile = useCallback(async () => {
    const filePath = await window.apkTool.selectAabFile()
    if (filePath) {
      setSelectedFile(filePath)
      setResult(null)
      setConversionError(null)
      setProgress({ stage: '', message: '', percent: 0 })
      addLog(`Selected AAB: ${filePath}`)
    }
  }, [addLog])

  const handleFileDrop = useCallback((filePath) => {
    if (filePath && filePath.toLowerCase().endsWith('.aab')) {
      setSelectedFile(filePath)
      setResult(null)
      setConversionError(null)
      setProgress({ stage: '', message: '', percent: 0 })
      addLog(`Selected AAB: ${filePath}`)
    } else {
      addLog('Please drop an .aab file.', 'error')
    }
  }, [addLog])

  const convert = useCallback(async () => {
    if (!selectedFile || converting) return

    setConverting(true)
    setResult(null)
    setConversionError(null)
    setProgress({ stage: 'starting', message: 'Starting conversion...', percent: 0 })
    addLog('Starting AAB to APK conversion...')

    try {
      const convResult = await window.apkTool.convertAab(selectedFile)
      setResult(convResult)
      addLog(`APK created: ${convResult.apkPath}`, 'success')
    } catch (error) {
      const msg = error.message || 'Conversion failed.'
      setConversionError(msg)
      addLog(`Error: ${msg}`, 'error')
    } finally {
      setConverting(false)
    }
  }, [selectedFile, converting, addLog])

  const selectApkForInstall = useCallback(async () => {
    const filePath = await window.apkTool.selectApkFile()
    if (filePath) {
      setInstallApkPath(filePath)
      setInstallStates({})
      addLog(`Selected APK for install: ${filePath}`)
    }
  }, [addLog])

  const handleApkDrop = useCallback((filePath) => {
    if (filePath && filePath.toLowerCase().endsWith('.apk')) {
      setInstallApkPath(filePath)
      setInstallStates({})
      addLog(`Selected APK for install: ${filePath}`)
    } else {
      addLog('Please drop an .apk file.', 'error')
    }
  }, [addLog])

  const refreshDevices = useCallback(async () => {
    setRefreshing(true)
    addLog('Refreshing device list...')
    try {
      const newDevices = await window.apkTool.refreshDevices()
      setDevices(newDevices)
      addLog(`Found ${newDevices.length} device(s).`, newDevices.length > 0 ? 'success' : 'info')
    } catch (error) {
      addLog(`Refresh failed: ${error.message}`, 'error')
    } finally {
      setRefreshing(false)
    }
  }, [addLog])

  const installToDevice = useCallback(async (serial) => {
    if (!installApkPath) return

    setInstallStates(prev => ({ ...prev, [serial]: { installing: true, result: null } }))
    addLog(`Installing APK to ${serial}...`)

    try {
      const installResult = await window.apkTool.installApk(serial, installApkPath)
      setInstallStates(prev => ({ ...prev, [serial]: { installing: false, result: { success: true, message: installResult.message } } }))
      addLog(`Installed on ${serial}: ${installResult.message}`, 'success')
    } catch (error) {
      const msg = error.message || 'Installation failed.'
      setInstallStates(prev => ({ ...prev, [serial]: { installing: false, result: { success: false, message: msg } } }))
      addLog(`Install failed on ${serial}: ${msg}`, 'error')
    }
  }, [installApkPath, addLog])

  const revealApk = useCallback(() => {
    if (result?.apkPath) {
      window.apkTool.revealInFinder(result.apkPath)
    }
  }, [result])

  const clearLogs = useCallback(() => {
    setLogs([])
  }, [])

  return {
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
    logRef,
    selectFile,
    handleFileDrop,
    convert,
    selectApkForInstall,
    handleApkDrop,
    refreshDevices,
    installToDevice,
    revealApk,
    clearLogs
  }
}
