// MS-OXTNEF winmail.dat: Exchange exports internal quarantined mail as one top-level TNEF part.
const TNEF_SIGNATURE = 0x223e9f78

const ATT_BODY = 0x800c
const ATT_ATTACH_DATA = 0x800f
const ATT_ATTACH_TITLE = 0x8010
const ATT_ATTACH_REND_DATA = 0x9002
const ATT_MAPI_PROPS = 0x9003
const ATT_ATTACHMENT = 0x9005

const PR_BODY = 0x1000
const PR_HTML = 0x1013
const PR_DISPLAY_NAME = 0x3001
const PR_ATTACH_DATA = 0x3701
const PR_ATTACH_LONG_FILENAME = 0x3707
const PR_ATTACH_MIME_TAG = 0x370e
const PR_ATTACH_CONTENT_ID = 0x3712

const PT_UNICODE = 0x001f
const PT_STRING8 = 0x001e
const FIXED_SIZE = {
  0x0002: 4,
  0x0003: 4,
  0x0004: 4,
  0x000a: 4,
  0x000b: 4,
  0x0005: 8,
  0x0006: 8,
  0x0007: 8,
  0x0014: 8,
  0x0040: 8,
  0x0048: 16,
}
const VARIABLE_SIZE = [0x0000, 0x000d, PT_STRING8, PT_UNICODE, 0x0102]

const pad4 = (length) => (length + 3) & ~3

const isTnef = (bytes) =>
  bytes?.byteLength >= 6 &&
  new DataView(bytes.buffer, bytes.byteOffset, 4).getUint32(0, true) ===
    TNEF_SIGNATURE

// ponytail: PT_STRING8 is read as windows-1252; Exchange writes PT_UNICODE for the names we read.
const decodeString = (bytes, type = PT_STRING8) =>
  new TextDecoder(type === PT_UNICODE ? 'utf-16le' : 'windows-1252')
    .decode(bytes)
    .replace(/\0+$/, '')

const decodeHtml = (bytes) => {
  const charset = new TextDecoder('ascii')
    .decode(bytes.subarray(0, 1024))
    .match(/charset=["']?([\w-]+)/i)?.[1]
  try {
    return new TextDecoder(charset || 'utf-8').decode(bytes)
  } catch {
    return new TextDecoder('utf-8').decode(bytes)
  }
}

const readMapiProps = (bytes) => {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
  const props = new Map()
  let offset = 4
  for (
    let i = view.getUint32(0, true);
    i > 0 && offset + 4 <= bytes.byteLength;
    i--
  ) {
    const multi = view.getUint16(offset, true) & 0x1000
    const type = view.getUint16(offset, true) & ~0x1000
    const id = view.getUint16(offset + 2, true)
    offset += 4
    if (id >= 0x8000) {
      const kind = view.getUint32(offset + 16, true)
      offset += 20
      offset += kind === 0 ? 4 : 4 + pad4(view.getUint32(offset, true))
    }
    let count = 1
    if (multi) {
      count = view.getUint32(offset, true)
      offset += 4
    }
    if (FIXED_SIZE[type]) {
      offset += FIXED_SIZE[type] * count
    } else if (VARIABLE_SIZE.includes(type)) {
      if (!multi) {
        count = view.getUint32(offset, true)
        offset += 4
      }
      for (let v = 0; v < count; v++) {
        const length = view.getUint32(offset, true)
        if (v === 0)
          props.set(id, {
            type,
            value: bytes.subarray(offset + 4, offset + 4 + length),
          })
        offset += 4 + pad4(length)
      }
    } else {
      break
    }
  }
  return props
}

export const decodeTnef = (bytes) => {
  if (!isTnef(bytes)) return null
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
  const message = { html: null, text: null, attachments: [] }
  const raw = []
  let offset = 6
  while (offset + 9 <= bytes.byteLength) {
    const level = bytes[offset]
    const id = view.getUint16(offset + 1, true)
    const length = view.getUint32(offset + 5, true)
    const data = bytes.subarray(offset + 9, offset + 9 + length)
    if (data.byteLength !== length) break
    offset += 9 + length + 2

    if (id === ATT_ATTACH_REND_DATA) {
      raw.push({})
    } else if (level === 2 && raw.length) {
      const current = raw[raw.length - 1]
      if (id === ATT_ATTACH_TITLE) current.title = decodeString(data)
      if (id === ATT_ATTACH_DATA) current.data = data
      if (id === ATT_ATTACHMENT) current.props = readMapiProps(data)
    } else if (level === 1 && id === ATT_BODY) {
      message.text = decodeString(data)
    } else if (level === 1 && id === ATT_MAPI_PROPS) {
      const props = readMapiProps(data)
      const html = props.get(PR_HTML)
      const body = props.get(PR_BODY)
      if (html) message.html = decodeHtml(html.value)
      if (body) message.text = decodeString(body.value, body.type)
    }
  }

  for (const attachment of raw) {
    const prop = (id) => {
      const found = attachment.props?.get(id)
      return found && (found.type === PT_UNICODE || found.type === PT_STRING8)
        ? decodeString(found.value, found.type)
        : null
    }
    const data =
      attachment.data ??
      attachment.props?.get(PR_ATTACH_DATA)?.value ??
      new Uint8Array(0)
    const nested = decodeTnef(data)
    if (nested) {
      message.html ??= nested.html
      message.text ??= nested.text
      message.attachments.push(...nested.attachments)
      continue
    }
    const contentId = prop(PR_ATTACH_CONTENT_ID)
    message.attachments.push({
      name:
        prop(PR_ATTACH_LONG_FILENAME) ||
        prop(PR_DISPLAY_NAME) ||
        attachment.title ||
        null,
      contentType: prop(PR_ATTACH_MIME_TAG) || 'application/octet-stream',
      id: contentId ? `<${contentId}>` : undefined,
      data,
    })
  }
  return message
}
