#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
RESOURCES_DIR="$PROJECT_DIR/resources"

BUNDLETOOL_VERSION="1.17.2"
BUNDLETOOL_URL="https://github.com/google/bundletool/releases/download/${BUNDLETOOL_VERSION}/bundletool-all-${BUNDLETOOL_VERSION}.jar"

PLATFORM_TOOLS_MAC="https://dl.google.com/android/repository/platform-tools-latest-darwin.zip"
PLATFORM_TOOLS_WIN="https://dl.google.com/android/repository/platform-tools-latest-windows.zip"

echo "=== APK Tool Resource Downloader ==="
echo ""

# Download bundletool
if [ -f "$RESOURCES_DIR/bundletool.jar" ]; then
  echo "[OK] bundletool.jar already exists"
else
  echo "[DL] Downloading bundletool v${BUNDLETOOL_VERSION}..."
  curl -L -o "$RESOURCES_DIR/bundletool.jar" "$BUNDLETOOL_URL"
  echo "[OK] bundletool.jar downloaded"
fi

# Download macOS adb
if [ -f "$RESOURCES_DIR/darwin/adb" ]; then
  echo "[OK] macOS adb already exists"
else
  echo "[DL] Downloading macOS platform-tools..."
  TMPDIR_MAC=$(mktemp -d)
  curl -L -o "$TMPDIR_MAC/platform-tools.zip" "$PLATFORM_TOOLS_MAC"
  unzip -q "$TMPDIR_MAC/platform-tools.zip" -d "$TMPDIR_MAC"
  cp "$TMPDIR_MAC/platform-tools/adb" "$RESOURCES_DIR/darwin/adb"
  chmod +x "$RESOURCES_DIR/darwin/adb"
  rm -rf "$TMPDIR_MAC"
  echo "[OK] macOS adb downloaded"
fi

# Download Windows adb
if [ -f "$RESOURCES_DIR/win32/adb.exe" ]; then
  echo "[OK] Windows adb already exists"
else
  echo "[DL] Downloading Windows platform-tools..."
  TMPDIR_WIN=$(mktemp -d)
  curl -L -o "$TMPDIR_WIN/platform-tools.zip" "$PLATFORM_TOOLS_WIN"
  unzip -q "$TMPDIR_WIN/platform-tools.zip" -d "$TMPDIR_WIN"
  cp "$TMPDIR_WIN/platform-tools/adb.exe" "$RESOURCES_DIR/win32/adb.exe"
  cp "$TMPDIR_WIN/platform-tools/AdbWinApi.dll" "$RESOURCES_DIR/win32/AdbWinApi.dll"
  cp "$TMPDIR_WIN/platform-tools/AdbWinUsbApi.dll" "$RESOURCES_DIR/win32/AdbWinUsbApi.dll"
  rm -rf "$TMPDIR_WIN"
  echo "[OK] Windows adb downloaded"
fi

echo ""
echo "=== All resources ready ==="
