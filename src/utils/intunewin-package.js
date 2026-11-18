// Packages must be under 4 GiB, so the zip never needs ZIP64 fields.
export const MAX_PACKAGE_BYTES = 4 * 1024 * 1024 * 1024 - 1
export const PACKAGE_BLOCK_BYTES = 8 * 1024 * 1024

// Reads an IntuneWinAppUtil package: Detection.xml values plus the encrypted payload as a Blob slice.
// The outer zip is stored (no compression), so the payload is a byte range of the file and nothing is read whole.
export const readIntuneWinPackage = async (file) => {
  if (file.size > MAX_PACKAGE_BYTES)
    throw new Error('Packages must be smaller than 4 GB')
  const view = async (start, end) =>
    new DataView(await file.slice(start, end).arrayBuffer())
  const tail = await view(Math.max(0, file.size - 65557), file.size)
  let eocd = -1
  for (let i = tail.byteLength - 22; i >= 0; i--) {
    if (tail.getUint32(i, true) === 0x06054b50) {
      eocd = i
      break
    }
  }
  if (eocd < 0) throw new Error('This file is not a .intunewin package')
  const count = tail.getUint16(eocd + 10, true)
  const cdSize = tail.getUint32(eocd + 12, true)
  const cdOffset = tail.getUint32(eocd + 16, true)
  const cd = await view(cdOffset, cdOffset + cdSize)
  const entries = {}
  for (let p = 0, k = 0; k < count; k++) {
    const method = cd.getUint16(p + 10, true)
    const comp = cd.getUint32(p + 20, true)
    const nameLen = cd.getUint16(p + 28, true)
    const extraLen = cd.getUint16(p + 30, true)
    const commentLen = cd.getUint16(p + 32, true)
    const local = cd.getUint32(p + 42, true)
    const name = new TextDecoder().decode(
      new Uint8Array(cd.buffer, cd.byteOffset + p + 46, nameLen)
    )
    const lh = await view(local, local + 30)
    const data = local + 30 + lh.getUint16(26, true) + lh.getUint16(28, true)
    entries[name] = { method, blob: file.slice(data, data + comp) }
    p += 46 + nameLen + extraLen + commentLen
  }
  const content = entries['IntuneWinPackage/Contents/IntunePackage.intunewin']
  const detection = entries['IntuneWinPackage/Metadata/Detection.xml']
  if (!content || !detection)
    throw new Error('The package is missing its content or Detection.xml')
  if (content.method !== 0)
    throw new Error(
      'The package content is compressed; rebuild it with IntuneWinAppUtil'
    )
  const xmlBlob =
    detection.method === 0
      ? detection.blob
      : await new Response(
          detection.blob
            .stream()
            .pipeThrough(new DecompressionStream('deflate-raw'))
        ).blob()
  const root = new DOMParser().parseFromString(
    await xmlBlob.text(),
    'application/xml'
  ).documentElement
  const text = (tag) => root.getElementsByTagName(tag)[0]?.textContent ?? null
  const group = (tag) => {
    const el = root.getElementsByTagName(tag)[0]
    return el
      ? Object.fromEntries(
          [...el.children].map((c) => [c.tagName, c.textContent])
        )
      : null
  }
  const metadata = {
    Name: text('Name'),
    SetupFile: text('SetupFile'),
    FileName: text('FileName'),
    ToolVersion: root.getAttribute('ToolVersion'),
    UnencryptedContentSize: Number(text('UnencryptedContentSize')),
    EncryptedSize: content.blob.size,
    EncryptionInfo: group('EncryptionInfo'),
    MsiInfo: group('MsiInfo'),
  }
  if (!metadata.EncryptionInfo?.EncryptionKey)
    throw new Error('Detection.xml has no encryption information')
  return { metadata, payload: content.blob }
}

export const blobToBase64 = (blob) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () =>
      resolve(reader.result.slice(reader.result.indexOf(',') + 1))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(blob)
  })

// Asks ExecUploadAppPackage once whether the host passes raw request bodies through, then returns
// `send(index, blob)` that stores one block of a new package as raw bytes, or as base64 JSON when it cannot.
// `post(url, data)` resolves with the axios response or rejects on a failed request.
export const createPackageBlockSender = async (post) => {
  const capabilities = await post('/api/ExecUploadAppPackage', {
    capabilities: true,
  })
  const binary = capabilities?.data?.Results?.binaryBlocks === true
  const packageId = crypto.randomUUID()
  const send = async (index, blob) => {
    if (binary) {
      await post(
        `/api/ExecUploadAppPackage?packageId=${packageId}&index=${index}`,
        new Blob([blob], { type: 'application/octet-stream' })
      )
    } else {
      await post('/api/ExecUploadAppPackage', {
        packageId,
        index,
        data: await blobToBase64(blob),
      })
    }
  }
  return { packageId, send }
}

// Sends an .intunewin payload (already encrypted) in 8 MB blocks, `parallel` at a time.
export const uploadIntuneWinPayload = async ({
  payload,
  post,
  onProgress,
  parallel = 4,
}) => {
  const { packageId, send } = await createPackageBlockSender(post)
  const blockCount = Math.ceil(payload.size / PACKAGE_BLOCK_BYTES)
  let done = 0
  const sendBlock = async (index) => {
    await send(
      index,
      payload.slice(
        index * PACKAGE_BLOCK_BYTES,
        (index + 1) * PACKAGE_BLOCK_BYTES
      )
    )
    onProgress?.(Math.round((++done / blockCount) * 100))
  }
  // Block 0 goes alone: the endpoint creates the storage container on it.
  await sendBlock(0)
  let next = 1
  const worker = async () => {
    while (next < blockCount) await sendBlock(next++)
  }
  await Promise.all([...Array(Math.min(parallel, blockCount - 1))].map(worker))
  return { packageId, blockCount }
}
