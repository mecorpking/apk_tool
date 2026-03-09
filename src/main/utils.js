import { app } from 'electron'
import path from 'path'
import fs from 'fs'
import { execFile } from 'child_process'

export function getResourcePath(relativePath) {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, relativePath)
  }
  return path.join(process.cwd(), 'resources', relativePath)
}

export function getBundletoolPath() {
  return getResourcePath('bundletool.jar')
}

export function getAdbPath() {
  const adbName = process.platform === 'win32' ? 'adb.exe' : 'adb'

  // 1. Prefer system adb (shares same adb server as user's existing setup)
  const systemAdb = findSystemAdb(adbName)
  if (systemAdb) return systemAdb

  // 2. Bundled adb - different paths in dev vs production
  let adbPath
  if (app.isPackaged) {
    // Production: electron-builder copies to platform-tools/
    adbPath = path.join(process.resourcesPath, 'platform-tools', adbName)
  } else {
    // Development: files are in resources/<platform>/
    const platformDir = process.platform === 'win32' ? 'win32' : 'darwin'
    adbPath = path.join(process.cwd(), 'resources', platformDir, adbName)
  }

  if (process.platform !== 'win32' && fs.existsSync(adbPath)) {
    try {
      fs.chmodSync(adbPath, 0o755)
    } catch (_) {}
  }

  return adbPath
}

function findSystemAdb(adbName) {
  // Check common system adb locations
  const { execFileSync } = require('child_process')
  try {
    // 'which' on macOS/Linux, 'where' on Windows
    const cmd = process.platform === 'win32' ? 'where' : 'which'
    const result = execFileSync(cmd, [adbName], { timeout: 3000, encoding: 'utf8' }).trim()
    if (result && fs.existsSync(result.split('\n')[0])) {
      return result.split('\n')[0]
    }
  } catch (_) {}

  // Check ANDROID_HOME / ANDROID_SDK_ROOT
  const sdkRoot = process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT
  if (sdkRoot) {
    const sdkAdb = path.join(sdkRoot, 'platform-tools', adbName)
    if (fs.existsSync(sdkAdb)) return sdkAdb
  }

  return null
}

export function detectJava() {
  return new Promise((resolve) => {
    execFile('java', ['-version'], { timeout: 10000 }, (error, stdout, stderr) => {
      if (error) {
        resolve({ available: false, version: null, error: 'Java not found. Please install Java JDK 11+.' })
        return
      }
      const output = stderr || stdout
      const match = output.match(/version "([^"]+)"/)
      const version = match ? match[1] : 'unknown'
      resolve({ available: true, version, error: null })
    })
  })
}

export function findKeytool() {
  return new Promise((resolve) => {
    const keytoolName = process.platform === 'win32' ? 'keytool.exe' : 'keytool'

    execFile(keytoolName, ['-help'], { timeout: 5000 }, (error) => {
      if (!error) {
        resolve(keytoolName)
        return
      }

      const javaHome = process.env.JAVA_HOME
      if (javaHome) {
        const keytoolPath = path.join(javaHome, 'bin', keytoolName)
        if (fs.existsSync(keytoolPath)) {
          resolve(keytoolPath)
          return
        }
      }

      resolve(null)
    })
  })
}

export function getTempDir() {
  const tmpDir = path.join(app.getPath('temp'), 'apk-tool')
  fs.mkdirSync(tmpDir, { recursive: true })
  return tmpDir
}

export function getKeystorePath() {
  return path.join(app.getPath('userData'), 'debug.keystore')
}
