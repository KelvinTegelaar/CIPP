import { describe, it, expect, vi } from 'vitest'
import {
  createDecipheriv,
  createHash,
  createHmac,
  randomBytes,
} from 'node:crypto'
import {
  encryptAndUploadPackage,
  readMacPackage,
} from '../../src/utils/macos-package'
import {
  installomatorPkg,
  swiftDialogDistribution,
} from '../mocks/macos-pkg-sample'

const fileOf = (bytes, name) => new File([bytes], name)

// Stores blocks as the endpoint would: the last write of an index wins, assembled in index order.
const storage = () => {
  const blocks = new Map()
  const post = vi.fn(async (url, body) => {
    if (body?.capabilities) return { data: { Results: { binaryBlocks: true } } }
    const index = Number(new URL(url, 'http://cipp').searchParams.get('index'))
    blocks.set(index, Buffer.from(await body.arrayBuffer()))
    return {}
  })
  const assembled = () =>
    Buffer.concat(
      [...blocks.keys()].sort((a, b) => a - b).map((i) => blocks.get(i))
    )
  return { post, blocks, assembled }
}

const verify = (encrypted, plain, info) => {
  const key = Buffer.from(info.EncryptionKey, 'base64')
  const macKey = Buffer.from(info.MacKey, 'base64')
  const iv = encrypted.subarray(32, 48)
  expect(iv.toString('base64')).toBe(info.InitializationVector)
  const mac = createHmac('sha256', macKey)
    .update(encrypted.subarray(32))
    .digest()
  expect(encrypted.subarray(0, 32).equals(mac)).toBe(true)
  expect(mac.toString('base64')).toBe(info.Mac)
  const decipher = createDecipheriv('aes-256-cbc', key, iv)
  const decrypted = Buffer.concat([
    decipher.update(encrypted.subarray(48)),
    decipher.final(),
  ])
  expect(decrypted.equals(plain)).toBe(true)
  expect(createHash('sha256').update(plain).digest('base64')).toBe(
    info.FileDigest
  )
}

describe('encryptAndUploadPackage', () => {
  it('produces Intune LOB content that decrypts and verifies across chunk boundaries', async () => {
    const plain = randomBytes(1000)
    const { post, assembled } = storage()

    const result = await encryptAndUploadPackage({
      file: fileOf(plain, 'App.pkg'),
      post,
      chunkBytes: 64,
    })

    const encrypted = assembled()
    expect(result.blockCount).toBe(Math.ceil(1000 / 64) + 1)
    expect(result.metadata.EncryptedSize).toBe(encrypted.length)
    expect(result.metadata.UnencryptedContentSize).toBe(1000)
    verify(encrypted, plain, result.metadata.EncryptionInfo)
  })

  it('keeps the final padding block when the file is an exact number of chunks', async () => {
    const plain = randomBytes(128)
    const { post, assembled } = storage()

    const result = await encryptAndUploadPackage({
      file: fileOf(plain, 'App.dmg'),
      post,
      chunkBytes: 64,
    })

    // 48-byte header + 128 bytes of data + one full 16-byte PKCS7 padding block
    expect(assembled().length).toBe(48 + 128 + 16)
    verify(assembled(), plain, result.metadata.EncryptionInfo)
  })

  it('writes the real header over the block 0 placeholder last', async () => {
    const { post, blocks } = storage()
    const writes = []
    post.mockImplementation(async (url, body) => {
      if (body?.capabilities)
        return { data: { Results: { binaryBlocks: true } } }
      const index = Number(
        new URL(url, 'http://cipp').searchParams.get('index')
      )
      writes.push(index)
      blocks.set(index, Buffer.from(await body.arrayBuffer()))
    })

    await encryptAndUploadPackage({
      file: fileOf(randomBytes(200), 'App.pkg'),
      post,
      chunkBytes: 64,
    })

    expect(writes[0]).toBe(0)
    expect(writes.at(-1)).toBe(0)
    expect(blocks.get(0).subarray(0, 32).equals(Buffer.alloc(32))).toBe(false)
  })
})

describe('readMacPackage', () => {
  it('reads only the top-level app, not helper apps nested inside it or resource bundles', async () => {
    const pkg = fileOf(
      Buffer.from(swiftDialogDistribution, 'base64'),
      'dialog-3.1.1-5000.pkg'
    )

    expect((await readMacPackage(pkg)).bundles).toEqual([
      { bundleId: 'au.csiro.dialog', bundleVersion: '3.1.1' },
    ])
  })

  it('reports no app for a package that installs none, leaving the bundle ID to the admin', async () => {
    const pkg = fileOf(
      Buffer.from(installomatorPkg, 'base64'),
      'Installomator-10.10.pkg'
    )

    expect(await readMacPackage(pkg)).toEqual({
      kind: 'pkg',
      title: null,
      bundles: [],
    })
  })

  it('reads nothing from a disk image, whose details are entered by hand', async () => {
    expect(
      await readMacPackage(fileOf(randomBytes(64), 'Rectangle.dmg'))
    ).toEqual({
      kind: 'dmg',
      bundles: [],
    })
  })

  it('refuses a .pkg that is not a flat package', async () => {
    await expect(
      readMacPackage(fileOf(randomBytes(64), 'Bundle.pkg'))
    ).rejects.toThrow('not a flat package')
  })
})
