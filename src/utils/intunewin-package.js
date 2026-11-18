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
// `post(url, data)` resolves with the axios response or rejects on a failed request. `installer` stores the
// blocks as an .exe or .msi for CIPP to package instead of an encrypted payload.
export const createPackageBlockSender = async (post, installer = false) => {
  const capabilities = await post('/api/ExecUploadAppPackage', {
    capabilities: true,
  })
  const binary = capabilities?.data?.Results?.binaryBlocks === true
  const packageId = crypto.randomUUID()
  const send = async (index, blob) => {
    if (binary) {
      await post(
        `/api/ExecUploadAppPackage?packageId=${packageId}&index=${index}${installer ? '&installer=true' : ''}`,
        new Blob([blob], { type: 'application/octet-stream' })
      )
    } else {
      await post('/api/ExecUploadAppPackage', {
        packageId,
        index,
        ...(installer && { installer }),
        data: await blobToBase64(blob),
      })
    }
  }
  return { packageId, send }
}

// Sends an .intunewin payload (already encrypted), or an installer, in 8 MB blocks, `parallel` at a time.
export const uploadIntuneWinPayload = async ({
  payload,
  post,
  onProgress,
  parallel = 4,
  installer = false,
}) => {
  const { packageId, send } = await createPackageBlockSender(post, installer)
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

// Uploads an .exe or .msi and waits while CIPP packages it. Resolves with what saving the template needs.
export const packageInstaller = async ({
  file,
  post,
  onProgress,
  onPackaging,
  pollMs = 3000,
  timeoutMs = 30 * 60 * 1000,
}) => {
  if (file.size > MAX_PACKAGE_BYTES)
    throw new Error('Installers must be smaller than 4 GB')
  const { packageId, blockCount } = await uploadIntuneWinPayload({
    payload: file,
    post,
    onProgress,
    installer: true,
  })
  await post('/api/ExecUploadAppPackage', {
    packageId,
    package: { setupFile: file.name, blockCount },
  })
  onPackaging?.()
  for (const started = Date.now(); Date.now() - started < timeoutMs;) {
    await new Promise((resolve) => setTimeout(resolve, pollMs))
    const result = (
      await post('/api/ExecUploadAppPackage', { packageId, status: true })
    )?.data?.Results
    if (result?.error) throw new Error(result.error)
    if (result?.blockCount)
      return {
        packageId,
        blockCount: result.blockCount,
        metadata: result.metadata,
      }
  }
  throw new Error(
    'Packaging did not finish within 30 minutes. Check the logbook for errors.'
  )
}

// The Detection.xml MsiInfo values IntuneWinAppUtil would write for an .msi
export const msiInfoFromProperties = (properties) => ({
  MsiProductCode: properties.ProductCode,
  MsiProductVersion: properties.ProductVersion,
  MsiUpgradeCode: properties.UpgradeCode ?? null,
  MsiPublisher: properties.Manufacturer ?? null,
  MsiExecutionContext:
    properties.ALLUSERS === '1'
      ? 'System'
      : properties.ALLUSERS === '2'
        ? 'Any'
        : 'User',
  MsiRequiresReboot: String(properties.REBOOT === 'Force'),
})

const MSI_NAME_CHARS =
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz._'
// MSI table streams are named with two characters packed per UTF-16 unit after a 0x4840 marker.
const msiStreamName = (name) => {
  let out = String.fromCharCode(0x4840)
  for (let i = 0; i < name.length; i += 2) {
    const a = MSI_NAME_CHARS.indexOf(name[i])
    out += String.fromCharCode(
      i + 1 < name.length
        ? 0x3800 + a + (MSI_NAME_CHARS.indexOf(name[i + 1]) << 6)
        : 0x4800 + a
    )
  }
  return out
}

// Reads the Property table of an .msi (an OLE compound file) with byte-range reads of the file.
export const readMsiProperties = async (file) => {
  const read = async (start, length) =>
    new Uint8Array(await file.slice(start, start + length).arrayBuffer())
  const header = await read(0, 512)
  const hv = new DataView(header.buffer)
  if (
    hv.getUint32(0, true) !== 0xe011cfd0 ||
    hv.getUint32(4, true) !== 0xe11ab1a1
  )
    throw new Error('This file is not an MSI package')
  const sectorSize = 1 << hv.getUint16(0x1e, true)
  const miniSectorSize = 1 << hv.getUint16(0x20, true)
  const miniCutoff = hv.getUint32(0x38, true)
  const perSector = sectorSize / 4
  const end = 0xfffffffa
  const sectorAt = (s) => (s + 1) * sectorSize

  const fatSectors = []
  for (let i = 0; i < 109; i++)
    fatSectors.push(hv.getUint32(0x4c + 4 * i, true))
  let difat = hv.getUint32(0x44, true)
  for (let n = hv.getUint32(0x48, true); n > 0 && difat < end; n--) {
    const dv = new DataView((await read(sectorAt(difat), sectorSize)).buffer)
    for (let i = 0; i < perSector - 1; i++)
      fatSectors.push(dv.getUint32(4 * i, true))
    difat = dv.getUint32(sectorSize - 4, true)
  }
  const fatCache = new Map()
  const readChain = async (start, size) => {
    const sectors = []
    for (let s = start; s < end && sectors.length * sectorSize < size;) {
      sectors.push(s)
      const index = Math.floor(s / perSector)
      if (!fatCache.has(index))
        fatCache.set(
          index,
          new DataView(
            (await read(sectorAt(fatSectors[index]), sectorSize)).buffer
          )
        )
      s = fatCache.get(index).getUint32(4 * (s % perSector), true)
    }
    const parts = []
    for (let i = 0, j; i < sectors.length; i = j) {
      for (
        j = i + 1;
        j < sectors.length && sectors[j] === sectors[j - 1] + 1;
        j++
      );
      parts.push(await read(sectorAt(sectors[i]), (j - i) * sectorSize))
    }
    const out = new Uint8Array(await new Blob(parts).arrayBuffer())
    return out.subarray(0, Math.min(out.length, size))
  }

  const wanted = {
    [msiStreamName('_StringPool')]: 'pool',
    [msiStreamName('_StringData')]: 'data',
    [msiStreamName('Property')]: 'property',
  }
  const dir = await readChain(hv.getUint32(0x30, true), Infinity)
  const dirView = new DataView(dir.buffer, dir.byteOffset, dir.byteLength)
  const streams = {}
  let root = null
  for (let o = 0; o + 128 <= dir.length; o += 128) {
    const nameLength = dirView.getUint16(o + 64, true)
    if (nameLength < 2) continue
    const entry = {
      start: dirView.getUint32(o + 116, true),
      size: dirView.getUint32(o + 120, true),
    }
    if (dir[o + 66] === 5) {
      root = entry
      continue
    }
    const name = String.fromCharCode(
      ...new Uint16Array(dir.slice(o, o + nameLength - 2).buffer)
    )
    if (wanted[name]) streams[wanted[name]] = entry
  }
  if (Object.keys(streams).length < 3)
    throw new Error('The MSI package has no Property table')

  let miniStream = null
  let miniFat = null
  const readStream = async (entry) => {
    if (entry.size >= miniCutoff) return readChain(entry.start, entry.size)
    if (!miniStream) {
      miniStream = await readChain(root.start, root.size)
      const fat = await readChain(hv.getUint32(0x3c, true), Infinity)
      miniFat = new DataView(fat.buffer, fat.byteOffset, fat.byteLength)
    }
    const out = new Uint8Array(entry.size)
    for (
      let s = entry.start, written = 0;
      s < end && written < entry.size;
      s = miniFat.getUint32(4 * s, true)
    ) {
      const take = Math.min(miniSectorSize, entry.size - written)
      out.set(
        miniStream.subarray(s * miniSectorSize, s * miniSectorSize + take),
        written
      )
      written += take
    }
    return out
  }
  const pool = await readStream(streams.pool)
  const data = await readStream(streams.data)
  const table = await readStream(streams.property)

  // Property: two string columns stored column by column, as string pool indexes of 2 or 3 bytes
  const poolView = new DataView(pool.buffer, pool.byteOffset, pool.byteLength)
  const codePage = poolView.getUint32(0, true)
  const refSize = codePage & 0x80000000 ? 3 : 2
  const rows = table.length / (2 * refSize)
  const refs = []
  for (let i = 0; i < 2 * rows; i++) {
    const at = i * refSize
    refs.push(
      table[at] +
        (table[at + 1] << 8) +
        (refSize === 3 ? table[at + 2] << 16 : 0)
    )
  }
  const highest = Math.max(...refs)
  let decoder
  try {
    decoder = new TextDecoder(`windows-${codePage & 0xffff}`)
  } catch {
    decoder = new TextDecoder()
  }
  const strings = new Map()
  for (
    let p = 4, offset = 0, index = 1;
    p + 4 <= pool.length && index <= highest;
    p += 4, index++
  ) {
    let length = poolView.getUint16(p, true)
    if (length === 0 && poolView.getUint16(p + 2, true) !== 0) {
      p += 4
      length = poolView.getUint32(p, true)
    }
    strings.set(index, decoder.decode(data.subarray(offset, offset + length)))
    offset += length
  }
  const properties = {}
  for (let r = 0; r < rows; r++)
    properties[strings.get(refs[r])] = strings.get(refs[rows + r])
  return properties
}
