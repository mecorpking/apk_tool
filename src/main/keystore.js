import fs from 'fs'
import { execFile } from 'child_process'
import { getKeystorePath, findKeytool } from './utils'

export async function generateDebugKeystore() {
  const keystorePath = getKeystorePath()

  if (fs.existsSync(keystorePath)) {
    return { created: false, path: keystorePath }
  }

  const keytool = await findKeytool()
  if (!keytool) {
    throw new Error('keytool not found. Please install Java JDK 11+ and ensure it is on your PATH.')
  }

  return new Promise((resolve, reject) => {
    const args = [
      '-genkeypair',
      '-keystore', keystorePath,
      '-alias', 'debugkey',
      '-keyalg', 'RSA',
      '-keysize', '2048',
      '-validity', '10000',
      '-storepass', 'android',
      '-keypass', 'android',
      '-dname', 'CN=Debug,OU=Debug,O=Debug,L=Debug,ST=Debug,C=US'
    ]

    execFile(keytool, args, { timeout: 30000 }, (error) => {
      if (error) {
        reject(new Error(`Failed to generate keystore: ${error.message}`))
        return
      }
      resolve({ created: true, path: keystorePath })
    })
  })
}
