import { execFile, spawn } from 'child_process'
import fs from 'fs'
import { getAdbPath } from './utils'

let pollingTimer = null
let isPolling = false

export async function listDevices() {
  const adbPath = getAdbPath()

  if (!fs.existsSync(adbPath)) {
    return []
  }

  return new Promise((resolve) => {
    execFile(adbPath, ['devices', '-l'], { timeout: 10000 }, (error, stdout) => {
      if (error) {
        resolve([])
        return
      }

      const lines = stdout.split('\n').filter(line => line.trim() && !line.startsWith('List of'))
      const devices = []

      for (const line of lines) {
        if (line.startsWith('*')) continue

        const parts = line.trim().split(/\s+/)
        if (parts.length < 2) continue

        const serial = parts[0]
        const status = parts[1]

        let model = serial
        const modelMatch = line.match(/model:(\S+)/)
        if (modelMatch) {
          model = modelMatch[1].replace(/_/g, ' ')
        }

        devices.push({ serial, status, model })
      }

      resolve(devices)
    })
  })
}

export async function installApk(serial, apkPath, onProgress) {
  const adbPath = getAdbPath()

  if (!fs.existsSync(adbPath)) {
    throw new Error('adb not found.')
  }

  if (!fs.existsSync(apkPath)) {
    throw new Error(`APK file not found: ${apkPath}`)
  }

  const progress = (message) => {
    if (onProgress) onProgress({ message })
  }

  progress(`Installing to ${serial}...`)

  return new Promise((resolve, reject) => {
    const proc = spawn(adbPath, ['-s', serial, 'install', '-r', apkPath], {
      stdio: ['ignore', 'pipe', 'pipe']
    })

    let output = ''

    proc.stdout.on('data', (data) => {
      const msg = data.toString().trim()
      output += msg + '\n'
      if (msg) progress(msg)
    })

    proc.stderr.on('data', (data) => {
      const msg = data.toString().trim()
      output += msg + '\n'
      if (msg) progress(msg)
    })

    proc.on('error', (err) => {
      reject(new Error(`Failed to start adb: ${err.message}`))
    })

    proc.on('close', (code) => {
      if (output.includes('Success')) {
        resolve({ success: true, message: 'APK installed successfully!' })
      } else if (code !== 0) {
        reject(new Error(`Installation failed (exit code ${code}):\n${output}`))
      } else {
        const failMatch = output.match(/Failure \[([^\]]+)\]/)
        if (failMatch) {
          reject(new Error(`Installation failed: ${failMatch[1]}`))
        } else {
          resolve({ success: true, message: 'APK installed.' })
        }
      }
    })
  })
}

export function startDevicePolling(callback, intervalMs = 3000) {
  stopDevicePolling()

  isPolling = true

  const poll = async () => {
    if (!isPolling) return
    const devices = await listDevices()
    if (isPolling) callback(devices)
  }

  poll()
  pollingTimer = setInterval(poll, intervalMs)
}

export function stopDevicePolling() {
  isPolling = false
  if (pollingTimer) {
    clearInterval(pollingTimer)
    pollingTimer = null
  }
}
