const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('apkTool', {
  checkJava: () => ipcRenderer.invoke('check-java'),
  selectAabFile: () => ipcRenderer.invoke('select-aab-file'),
  selectApkFile: () => ipcRenderer.invoke('select-apk-file'),
  convertAab: (aabFilePath) => ipcRenderer.invoke('convert-aab', aabFilePath),
  getDevices: () => ipcRenderer.invoke('get-devices'),
  refreshDevices: () => ipcRenderer.invoke('refresh-devices'),
  installApk: (serial, apkPath) => ipcRenderer.invoke('install-apk', { serial, apkPath }),
  startDevicePolling: () => ipcRenderer.invoke('start-device-polling'),
  stopDevicePolling: () => ipcRenderer.invoke('stop-device-polling'),
  revealInFinder: (filePath) => ipcRenderer.invoke('reveal-in-finder', filePath),

  onConversionProgress: (callback) => {
    const handler = (_event, data) => callback(data)
    ipcRenderer.on('conversion-progress', handler)
    return () => ipcRenderer.removeListener('conversion-progress', handler)
  },
  onDevicesUpdated: (callback) => {
    const handler = (_event, devices) => callback(devices)
    ipcRenderer.on('devices-updated', handler)
    return () => ipcRenderer.removeListener('devices-updated', handler)
  },
  onInstallProgress: (callback) => {
    const handler = (_event, data) => callback(data)
    ipcRenderer.on('install-progress', handler)
    return () => ipcRenderer.removeListener('install-progress', handler)
  }
})
