import { createHMAC, createSHA256 } from 'hash-wasm'
import {
  createPackageBlockSender,
  PACKAGE_BLOCK_BYTES,
} from './intunewin-package'

// A ciphertext chunk is its plaintext plus at most one 16-byte padding block, so plaintext chunks stay
// 16 bytes under a storage block. 511 chunks plus the header block keep a package within 512 blocks.
export const MAC_PLAIN_CHUNK_BYTES = PACKAGE_BLOCK_BYTES - 16
const MAX_BLOCKS = 512

// The table of contents and Distribution are a few KB, so they are read whole before inflating.
const unzlib = async (blob) =>
  new Uint8Array(
    await new Response(
      new Response(await blob.arrayBuffer()).body.pipeThrough(
        new DecompressionStream('deflate')
      )
    ).arrayBuffer()
  )

// Reads bundle ids and versions from a flat .pkg (xar archive) without loading the payload:
// header -> zlib table of contents -> Distribution or PackageInfo from the heap.
export const readMacPackage = async (file) => {
  if (/\.dmg$/i.test(file.name)) return { kind: 'dmg', bundles: [] }
  if (!/\.pkg$/i.test(file.name)) throw new Error('Choose a .pkg or .dmg file')
  const header = new DataView(await file.slice(0, 28).arrayBuffer())
  if (header.byteLength < 28 || header.getUint32(0) !== 0x78617221) {
    throw new Error('This .pkg is not a flat package (xar archive)')
  }
  const headerSize = header.getUint16(4)
  const tocLength = Number(header.getBigUint64(8))
  const heap = headerSize + tocLength
  const toc = new DOMParser().parseFromString(
    new TextDecoder().decode(await unzlib(file.slice(headerSize, heap))),
    'application/xml'
  )
  const readEntry = async (name) => {
    const entry = [...toc.getElementsByTagName('file')].find(
      (f) =>
        [...f.children].find((c) => c.tagName === 'name')?.textContent === name
    )
    const data = entry && [...entry.children].find((c) => c.tagName === 'data')
    if (!data) return null
    const field = (tag) => data.getElementsByTagName(tag)[0]
    const offset = Number(field('offset').textContent)
    const length = Number(field('length').textContent)
    const raw = file.slice(heap + offset, heap + offset + length)
    // xar marks zlib streams as application/x-gzip
    const bytes = /gzip/.test(field('encoding')?.getAttribute('style') ?? '')
      ? await unzlib(raw)
      : new Uint8Array(await raw.arrayBuffer())
    return new DOMParser().parseFromString(
      new TextDecoder().decode(bytes),
      'application/xml'
    )
  }
  const xml =
    (await readEntry('Distribution')) ?? (await readEntry('PackageInfo'))
  if (!xml) return { kind: 'pkg', bundles: [] }
  const all = (tag) => [...xml.getElementsByTagName(tag)]
  const seen = new Set()
  const bundles = all('bundle')
    // Top-level apps only: helper apps nested inside another .app are not installed apps of their own.
    .filter((b) => {
      const path = b.getAttribute('path') ?? ''
      return (
        /\.app$/i.test(path) && !/\.app\//i.test(path) && b.getAttribute('id')
      )
    })
    .map((b) => ({
      bundleId: b.getAttribute('id'),
      bundleVersion: b.getAttribute('CFBundleShortVersionString') ?? '',
    }))
    .filter((b) => !seen.has(b.bundleId) && seen.add(b.bundleId))
  const title = all('title')[0]?.textContent?.trim()
  return { kind: 'pkg', title: title || null, bundles }
}

const toBase64 = (bytes) => {
  let binary = ''
  for (let i = 0; i < bytes.length; i += 0x8000)
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000))
  return btoa(binary)
}

// Encrypts a raw installer the way Intune expects LOB content ([HMAC 32][IV 16][AES-256-CBC ciphertext],
// HMAC-SHA256 over IV + ciphertext, SHA-256 digest of the plaintext) while uploading it in blocks.
// Block 0 holds the header: a placeholder goes first (the endpoint creates storage on block 0) and the
// real HMAC replaces it once the last chunk is encrypted.
export const encryptAndUploadPackage = async ({
  file,
  post,
  onProgress,
  parallel = 4,
  chunkBytes = MAC_PLAIN_CHUNK_BYTES,
}) => {
  const chunkCount = Math.max(1, Math.ceil(file.size / chunkBytes))
  if (chunkCount + 1 > MAX_BLOCKS)
    throw new Error('Packages must be smaller than 4 GB')
  const { packageId, send } = await createPackageBlockSender(post)
  const encryptionKey = crypto.getRandomValues(new Uint8Array(32))
  const macKey = crypto.getRandomValues(new Uint8Array(32))
  const iv = crypto.getRandomValues(new Uint8Array(16))
  const aesKey = await crypto.subtle.importKey(
    'raw',
    encryptionKey,
    'AES-CBC',
    false,
    ['encrypt']
  )
  const digest = await createSHA256()
  digest.init()
  const mac = await createHMAC(createSHA256(), macKey)
  mac.init()
  mac.update(iv)

  await send(0, new Blob([new Uint8Array(32), iv]))
  let chainIv = iv
  let encryptedSize = 48
  let done = 0
  const inFlight = new Set()
  for (let i = 0; i < chunkCount; i++) {
    const plain = new Uint8Array(
      await file.slice(i * chunkBytes, (i + 1) * chunkBytes).arrayBuffer()
    )
    digest.update(plain)
    let cipher = new Uint8Array(
      await crypto.subtle.encrypt(
        { name: 'AES-CBC', iv: chainIv },
        aesKey,
        plain
      )
    )
    // WebCrypto always pads; every chunk but the last is a whole number of blocks, so its padding block
    // is dropped and the chain continues from the last ciphertext block.
    if (i < chunkCount - 1) cipher = cipher.subarray(0, cipher.length - 16)
    chainIv = cipher.slice(cipher.length - 16)
    mac.update(cipher)
    encryptedSize += cipher.length
    const upload = send(i + 1, new Blob([cipher])).then(() => {
      inFlight.delete(upload)
      onProgress?.(Math.round((++done / (chunkCount + 1)) * 100))
    })
    upload.catch(() => {})
    inFlight.add(upload)
    if (inFlight.size >= parallel) await Promise.race(inFlight)
  }
  await Promise.all(inFlight)
  const hmac = mac.digest('binary')
  await send(0, new Blob([hmac, iv]))
  onProgress?.(100)

  return {
    packageId,
    blockCount: chunkCount + 1,
    metadata: {
      Name: file.name,
      FileName: file.name,
      UnencryptedContentSize: file.size,
      EncryptedSize: encryptedSize,
      EncryptionInfo: {
        EncryptionKey: toBase64(encryptionKey),
        MacKey: toBase64(macKey),
        InitializationVector: toBase64(iv),
        Mac: toBase64(hmac),
        ProfileIdentifier: 'ProfileVersion1',
        FileDigest: toBase64(digest.digest('binary')),
        FileDigestAlgorithm: 'SHA256',
      },
    },
  }
}
