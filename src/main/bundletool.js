import path from 'path'
import fs from 'fs'
import { spawn } from 'child_process'
import extract from 'extract-zip'
import { getBundletoolPath, getKeystorePath, getTempDir } from './utils'
import { generateDebugKeystore } from './keystore'

export async function convertAabToApk(aabFilePath, onProgress) {
  const progress = (stage, message, percent) => {
    if (onProgress) onProgress({ stage, message, percent })
  }

  if (!fs.existsSync(aabFilePath)) {
    throw new Error(`File not found: ${aabFilePath}`)
  }
  if (!aabFilePath.toLowerCase().endsWith('.aab')) {
    throw new Error('Selected file is not an AAB file.')
  }

  progress('keystore', 'Generating debug keystore...', 5)

  const keyResult = await generateDebugKeystore()
  const keystorePath = keyResult.path
  progress('keystore', keyResult.created ? 'Debug keystore created.' : 'Using existing debug keystore.', 10)

  const baseName = path.basename(aabFilePath, '.aab')
  const tempDir = getTempDir()
  const apksPath = path.join(tempDir, baseName + '.apks')
  const extractDir = path.join(tempDir, baseName + '_extracted')
  const outputApkPath = path.join(path.dirname(aabFilePath), baseName + '.apk')
  const bundletoolPath = getBundletoolPath()

  if (!fs.existsSync(bundletoolPath)) {
    throw new Error('bundletool.jar not found. Please run scripts/download-resources.sh')
  }

  if (fs.existsSync(apksPath)) fs.unlinkSync(apksPath)
  if (fs.existsSync(extractDir)) fs.rmSync(extractDir, { recursive: true })

  progress('conversion', 'Running bundletool...', 15)

  await new Promise((resolve, reject) => {
    const args = [
      '-jar', bundletoolPath,
      'build-apks',
      '--bundle=' + aabFilePath,
      '--output=' + apksPath,
      '--mode=universal',
      '--ks=' + keystorePath,
      '--ks-key-alias=debugkey',
      '--ks-pass=pass:android',
      '--key-pass=pass:android'
    ]

    const proc = spawn('java', args, { stdio: ['ignore', 'pipe', 'pipe'] })
    let stderrData = ''

    proc.stdout.on('data', (data) => {
      const msg = data.toString().trim()
      if (msg) progress('conversion', msg, 40)
    })

    proc.stderr.on('data', (data) => {
      const msg = data.toString().trim()
      stderrData += msg + '\n'
      if (msg) progress('conversion', msg, 40)
    })

    proc.on('error', (err) => {
      reject(new Error(`Failed to start bundletool: ${err.message}. Is Java installed?`))
    })

    proc.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`bundletool failed (exit code ${code}):\n${stderrData}`))
      } else {
        resolve()
      }
    })
  })

  progress('extraction', 'Extracting universal APK...', 75)

  fs.mkdirSync(extractDir, { recursive: true })
  await extract(apksPath, { dir: extractDir })

  const universalApk = path.join(extractDir, 'universal.apk')
  if (!fs.existsSync(universalApk)) {
    const files = fs.readdirSync(extractDir)
    const apkFile = files.find(f => f.endsWith('.apk'))
    if (!apkFile) {
      throw new Error('No APK found in the generated .apks archive.')
    }
    fs.copyFileSync(path.join(extractDir, apkFile), outputApkPath)
  } else {
    fs.copyFileSync(universalApk, outputApkPath)
  }

  progress('cleanup', 'Cleaning up temporary files...', 90)

  try {
    fs.unlinkSync(apksPath)
    fs.rmSync(extractDir, { recursive: true })
  } catch (_) {}

  const stats = fs.statSync(outputApkPath)
  progress('done', 'Conversion complete!', 100)

  return {
    apkPath: outputApkPath,
    size: stats.size
  }
}
