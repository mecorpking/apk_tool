/**
 * @type {import('electron-builder').Configuration}
 */
module.exports = {
  appId: 'com.apktool.app',
  productName: 'APK Tool',
  directories: {
    output: 'dist'
  },
  files: [
    'out/**/*'
  ],
  extraResources: [
    {
      from: 'resources/bundletool.jar',
      to: 'bundletool.jar'
    }
  ],
  mac: {
    target: ['dmg', 'zip'],
    category: 'public.app-category.developer-tools',
    extraResources: [
      {
        from: 'resources/darwin/',
        to: 'platform-tools/',
        filter: ['**/*']
      }
    ]
  },
  win: {
    target: ['portable'],
    extraResources: [
      {
        from: 'resources/win32/',
        to: 'platform-tools/',
        filter: ['**/*']
      }
    ]
  }
}
