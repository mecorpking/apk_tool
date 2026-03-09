import { ipcMain, dialog, shell } from 'electron'
import { detectJava } from './utils'
import { convertAabToApk } from './bundletool'
import { listDevices, installApk, startDevicePolling, stopDevicePolling } from './adb'

export function registerIpcHandlers() {
  ipcMain.handle('check-java', async () => {
    return await detectJava()
  })

  ipcMain.handle('select-aab-file', async () => {
    const result = await dialog.showOpenDialog({
      title: 'Select AAB File',
      filters: [{ name: 'Android App Bundle', extensions: ['aab'] }],
      properties: ['openFile']
    })
    if (result.canceled || result.filePaths.length === 0) {
      return null
    }
    return result.filePaths[0]
  })

  ipcMain.handle('convert-aab', async (event, aabFilePath) => {
    try {
      const result = await convertAabToApk(aabFilePath, (progress) => {
        event.sender.send('conversion-progress', progress)
      })
      return result
    } catch (error) {
      throw new Error(error.message)
    }
  })

  ipcMain.handle('get-devices', async () => {
    return await listDevices()
  })

  ipcMain.handle('refresh-devices', async () => {
    return await listDevices()
  })

  ipcMain.handle('select-apk-file', async () => {
    const result = await dialog.showOpenDialog({
      title: 'Select APK File',
      filters: [{ name: 'Android Package', extensions: ['apk'] }],
      properties: ['openFile']
    })
    if (result.canceled || result.filePaths.length === 0) {
      return null
    }
    return result.filePaths[0]
  })

  ipcMain.handle('install-apk', async (event, { serial, apkPath }) => {
    try {
      const result = await installApk(serial, apkPath, (progress) => {
        event.sender.send('install-progress', { serial, ...progress })
      })
      return result
    } catch (error) {
      throw new Error(error.message)
    }
  })

  ipcMain.handle('start-device-polling', async (event) => {
    startDevicePolling((devices) => {
      event.sender.send('devices-updated', devices)
    })
    return true
  })

  ipcMain.handle('stop-device-polling', async () => {
    stopDevicePolling()
    return true
  })

  ipcMain.handle('reveal-in-finder', async (_event, filePath) => {
    shell.showItemInFolder(filePath)
    return true
  })
}
