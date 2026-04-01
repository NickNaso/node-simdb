#!/usr/bin/env node
'use strict'

/**
 * download-deps.js
 *
 * Downloads the correct pre-built simdb library for the current platform/arch
 * from the GitHub release and extracts it into deps/simdb/.
 *
 * Expected output layout:
 *   deps/simdb/include/simdb.hpp
 *   deps/simdb/lib/libsimdb.a      (Unix)
 *   deps/simdb/lib/simdb.lib       (Windows)
 */

const https   = require('https')
const http    = require('http')
const fs      = require('fs')
const path    = require('path')
const os      = require('os')
const zlib    = require('zlib')
const { execFileSync } = require('child_process')

// ── Config ────────────────────────────────────────────────────────────────────
const SIMDB_VERSION = 'v0.0.1'
const BASE_URL = `https://github.com/NickNaso/simdb/releases/download/${SIMDB_VERSION}`
const DEPS_DIR = path.join(__dirname, '..', 'deps', 'simdb')

// ── Platform → asset name mapping ────────────────────────────────────────────
function getAssetName () {
  const plat = process.platform // 'darwin' | 'linux' | 'win32' | 'freebsd'
  const arch = process.arch     // 'x64' | 'arm64' | 'arm' | 'ia32' | 'mips' ...

  const platformMap = {
    darwin:  'macos',
    linux:   'linux',
    win32:   'win',
    freebsd: 'freebsd',
    netbsd:  'netbsd',
  }

  const archMap = {
    x64:    'x64',
    arm64:  'arm64',
    arm:    'arm32',
    ia32:   'x86',
    mips:   'mips',
    mips64: 'mips64',
    ppc64:  'ppc64le',
    riscv64:'riscv64',
  }

  const platKey = platformMap[plat]
  const archKey = archMap[arch]

  if (!platKey) {
    throw new Error(`Unsupported platform: ${plat}`)
  }
  if (!archKey) {
    throw new Error(`Unsupported architecture: ${arch}`)
  }

  return `simdb-${platKey}-${archKey}.zip`
}

// ── HTTP(S) download with redirect support ────────────────────────────────────
function download (url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest)
    const protocol = url.startsWith('https') ? https : http

    const req = protocol.get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        // Follow redirect
        file.close()
        fs.unlinkSync(dest)
        download(res.headers.location, dest).then(resolve).catch(reject)
        return
      }
      if (res.statusCode !== 200) {
        file.close()
        fs.unlinkSync(dest)
        reject(new Error(`Download failed: HTTP ${res.statusCode} for ${url}`))
        return
      }
      res.pipe(file)
      file.on('finish', () => file.close(resolve))
    })

    req.on('error', (err) => {
      file.close()
      try { fs.unlinkSync(dest) } catch (_) {}
      reject(err)
    })
  })
}

// ── Unzip using system `unzip` (available on macOS/Linux) or PowerShell (Win) 
function extractZip (zipPath, destDir) {
  fs.mkdirSync(destDir, { recursive: true })

  if (process.platform === 'win32') {
    execFileSync('powershell', [
      '-NoProfile', '-NonInteractive', '-Command',
      `Expand-Archive -Path '${zipPath}' -DestinationPath '${destDir}' -Force`,
    ])
  } else {
    execFileSync('unzip', ['-o', zipPath, '-d', destDir])
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main () {
  // Check if deps are already installed (skip re-download)
  const includeFile = path.join(DEPS_DIR, 'include', 'simdb.hpp')
  const libFile = path.join(DEPS_DIR, 'lib', process.platform === 'win32' ? 'simdb.lib' : 'libsimdb.a')

  if (fs.existsSync(includeFile) && fs.existsSync(libFile)) {
    console.log('[download-deps] simdb deps already present — skipping download.')
    return
  }

  const assetName = getAssetName()
  const url = `${BASE_URL}/${assetName}`
  const tmpZip = path.join(os.tmpdir(), assetName)

  console.log(`[download-deps] Downloading ${assetName} ...`)
  await download(url, tmpZip)
  console.log(`[download-deps] Extracting to ${DEPS_DIR} ...`)
  extractZip(tmpZip, DEPS_DIR)

  // Clean up temp file
  try { fs.unlinkSync(tmpZip) } catch (_) {}

  // Verify
  if (!fs.existsSync(includeFile)) {
    throw new Error(`Extraction failed — ${includeFile} not found`)
  }

  console.log('[download-deps] Done.')
}

main().catch((err) => {
  console.error('[download-deps] ERROR:', err.message)
  process.exit(1)
})
