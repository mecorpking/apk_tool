# APK Tool

A cross-platform desktop application to convert Android App Bundle (`.aab`) files to APK and install APKs directly to connected Android devices. Built with Electron, React, and Google's official bundletool.

**No command line needed.** Everything — signing key generation, AAB conversion, device detection, APK installation — is handled through the UI.

![Platform](https://img.shields.io/badge/platform-macOS%20%7C%20Windows-blue)
![License](https://img.shields.io/badge/license-MIT-green)

---

## Features

### Convert Tab
- **AAB to APK conversion** — Select or drag-drop an `.aab` file and convert it to a universal `.apk` with one click
- **Automatic signing** — Debug keystore is auto-generated on first use (no manual `keytool` commands)
- **Progress tracking** — Real-time progress bar and status messages during conversion
- **Show in Folder** — Quickly locate the generated APK in Finder / Explorer

### Install Tab
- **Direct APK installation** — Select or drag-drop any `.apk` file to install (no conversion required)
- **Auto-detect devices** — Connected Android devices are detected automatically via ADB
- **Manual refresh** — Refresh button to re-scan for devices on demand
- **One-click install** — Install the selected APK to any connected device with a single click
- **Multi-device support** — Install to multiple devices independently
- **Device status** — Shows connection status (connected / unauthorized / offline) with helpful hints

### General
- **Portable** — No installer needed. Single executable on Windows, `.app` bundle on macOS
- **Dark theme** — Clean developer-focused UI
- **Real-time logs** — Collapsible output log panel showing all operations

---

## Download

Download the latest release for your platform from the [Releases](https://github.com/mecorpking/apk_tool/releases) page:

| Platform | File | Notes |
|----------|------|-------|
| **macOS** | `APK-Tool-x.x.x.dmg` | Open DMG, drag to Applications |
| **macOS** | `APK-Tool-x.x.x-mac.zip` | Extract and run directly |
| **Windows** | `APK-Tool-x.x.x.exe` | Portable — just run, no install |

---

## Prerequisites

### Java JDK 11+

The app requires Java to run bundletool. The app detects Java automatically and shows a warning with install link if missing.

- **macOS**: `brew install openjdk@17` or download from [Adoptium](https://adoptium.net/)
- **Windows**: Download from [Adoptium](https://adoptium.net/) and ensure it's added to PATH

### USB Debugging (for device installation)

To install APKs to a device:

1. On your Android device, go to **Settings > About phone**
2. Tap **Build number** 7 times to enable Developer options
3. Go to **Settings > Developer options**
4. Enable **USB debugging**
5. Connect via USB and accept the debugging prompt on the device

---

## How It Works

### Converting AAB to APK

1. Open the app and go to the **Convert** tab
2. Click the drop zone or drag-drop an `.aab` file
3. Click **Convert to APK**
4. The app will:
   - Auto-generate a debug signing keystore (first time only)
   - Run Google's bundletool to build a universal APK set
   - Extract the universal APK from the archive
   - Place the `.apk` file next to the original `.aab` file
5. Click **Show in Folder** to locate the APK

### Installing APK to Device

1. Go to the **Install** tab
2. Select or drag-drop an `.apk` file (or it's auto-populated after conversion)
3. Connect an Android device via USB with debugging enabled
4. Click **Refresh** if your device isn't listed
5. Click **Install** next to the target device

---

## Building from Source

### Requirements

- [Node.js](https://nodejs.org/) 18+
- [Java JDK](https://adoptium.net/) 11+
- Git

### Setup

```bash
# Clone the repository
git clone https://github.com/mecorpking/apk_tool.git
cd apk_tool

# Install dependencies
npm install

# Download bundletool and ADB binaries
bash scripts/download-resources.sh
```

### Development

```bash
npm run dev
```

This starts the Electron app with hot-reload for the renderer process.

### Build for Distribution

```bash
# macOS (produces .dmg and .zip in dist/)
npm run package:mac

# Windows (produces portable .exe in dist/)
npm run package:win
```

---

## Project Structure

```
APK_Tool/
├── package.json                  # Dependencies and scripts
├── electron.vite.config.js       # Vite build config for main/preload/renderer
├── electron-builder.config.js    # Packaging config (portable Win, DMG Mac)
├── scripts/
│   └── download-resources.sh     # Downloads bundletool + ADB binaries
├── resources/                    # Bundled external tools
│   ├── bundletool.jar            # Google's AAB-to-APK tool
│   ├── darwin/adb                # macOS ADB binary
│   └── win32/adb.exe + DLLs     # Windows ADB binaries
└── src/
    ├── main/                     # Electron main process
    │   ├── index.js              # App entry, window creation
    │   ├── ipc-handlers.js       # IPC bridge (UI ↔ backend)
    │   ├── bundletool.js         # AAB→APK conversion pipeline
    │   ├── keystore.js           # Debug keystore auto-generation
    │   ├── adb.js                # Device detection + APK installation
    │   └── utils.js              # Java detection, path resolution
    ├── preload/
    │   └── index.js              # Secure contextBridge API
    └── renderer/                 # React UI
        ├── App.jsx               # Root component with tab navigation
        ├── hooks/useApkTool.js   # State management hook
        ├── components/
        │   ├── Header.jsx        # Title + Java status indicator
        │   ├── FileDropZone.jsx  # AAB file selection (drag-drop)
        │   ├── ConversionPanel.jsx # Convert button + progress + result
        │   ├── DeviceList.jsx    # APK picker + devices + install
        │   └── LogPanel.jsx      # Real-time log output
        └── styles/
            └── app.css           # Dark theme styles
```

---

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Desktop framework | [Electron](https://www.electronjs.org/) |
| UI library | [React 18](https://react.dev/) |
| Build tooling | [electron-vite](https://electron-vite.org/) + [Vite](https://vitejs.dev/) |
| Packaging | [electron-builder](https://www.electron.build/) |
| AAB conversion | [Google bundletool](https://github.com/google/bundletool) |
| Device management | [Android ADB](https://developer.android.com/tools/adb) |
| Signing | Java keytool (auto-managed) |

---

## Troubleshooting

### "Java not found"
Install Java JDK 11+ and ensure `java` is on your system PATH. Restart the app after installing.

### Device not detected
- Ensure USB debugging is enabled on the device
- Try a different USB cable (some cables are charge-only)
- Click the **Refresh** button in the Install tab
- On the device, revoke and re-authorize USB debugging permissions
- On macOS, the first ADB connection may require accepting a security prompt

### "Unauthorized" device status
Accept the USB debugging authorization dialog on your Android device. If it doesn't appear, disconnect and reconnect the USB cable.

### Conversion fails with bundletool error
- Ensure the `.aab` file is valid and not corrupted
- Check that Java 11+ is installed (some bundletool versions require it)
- Look at the Output Log panel for detailed error messages

### macOS: "App is damaged" or Gatekeeper warning
The app is unsigned for development builds. Run this to bypass:
```bash
xattr -cr /Applications/APK\ Tool.app
```

---

## License

MIT
