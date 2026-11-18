import { describe, it, expect, vi } from 'vitest'
import { createHash } from 'node:crypto'
import {
  readIntuneWinPackage,
  readMsiProperties,
  msiInfoFromProperties,
  packageInstaller,
  uploadIntuneWinPayload,
  MAX_PACKAGE_BYTES,
  PACKAGE_BLOCK_BYTES,
} from '../../src/utils/intunewin-package'
import { intuneWinAppUtilSample } from '../mocks/intunewin-sample'
import { msiSample } from '../mocks/msi-sample'

const sampleFile = () =>
  new Blob([Buffer.from(intuneWinAppUtilSample, 'base64')], {
    type: 'application/octet-stream',
  })

const sha256 = async (blob) =>
  createHash('sha256')
    .update(Buffer.from(await blob.arrayBuffer()))
    .digest('hex')

describe('readIntuneWinPackage', () => {
  it('returns exactly the encrypted payload entry of an IntuneWinAppUtil package', async () => {
    const { payload } = await readIntuneWinPackage(sampleFile())

    // Same bytes .NET ZipArchive extracts from IntuneWinPackage/Contents/IntunePackage.intunewin.
    expect(payload.size).toBe(304)
    expect(await sha256(payload)).toBe(
      '5432735796ca9b63069c026dc2d4c2ceb2299672ea53c79b0b80a8fb714bc719'
    )
  })

  it('maps the Detection.xml values the deployment needs', async () => {
    const { metadata } = await readIntuneWinPackage(sampleFile())

    expect(metadata.SetupFile).toBe('install.cmd')
    expect(metadata.FileName).toBe('IntunePackage.intunewin')
    expect(metadata.ToolVersion).toBe('1.8.7.0')
    expect(metadata.UnencryptedContentSize).toBe(249)
    expect(metadata.EncryptedSize).toBe(304)
    expect(metadata.EncryptionInfo.EncryptionKey).toBe(
      'YcHoTiJPYuDJkQVM9qOuqKqtXb/wBB3fEwypUvA3N+E='
    )
    expect(metadata.EncryptionInfo.FileDigestAlgorithm).toBe('SHA256')
    expect(metadata.MsiInfo).toBeNull()
  })

  it('refuses a package of 4 GB or more before reading it', async () => {
    const slice = vi.fn()

    await expect(
      readIntuneWinPackage({ size: 4 * 1024 ** 3, slice })
    ).rejects.toThrow('smaller than 4 GB')
    expect(slice).not.toHaveBeenCalled()
  })

  it('refuses a file that is not a zip', async () => {
    await expect(
      readIntuneWinPackage(new Blob(['setup.exe, not a package']))
    ).rejects.toThrow('not a .intunewin package')
  })
})

describe('uploadIntuneWinPayload', () => {
  const payloadOf = (blocks) =>
    new Blob([new Uint8Array(Math.round(blocks * PACKAGE_BLOCK_BYTES))])

  // The endpoint answers the capability question first, then takes blocks.
  const host = (binaryBlocks, onBlock) =>
    vi.fn(async (url, body) => {
      if (body?.capabilities) return { data: { Results: { binaryBlocks } } }
      return onBlock(url, body)
    })
  const queryOf = (url) => new URL(url, 'http://cipp').searchParams

  it('finishes block 0 before sending any other block', async () => {
    const events = []
    let releaseFirst
    const post = host(true, (url) => {
      const index = Number(queryOf(url).get('index'))
      events.push(`start ${index}`)
      if (index === 0) {
        return new Promise((resolve) => {
          releaseFirst = () => {
            events.push('end 0')
            resolve({})
          }
        })
      }
      return {}
    })

    const upload = uploadIntuneWinPayload({ payload: payloadOf(3), post })
    await vi.waitFor(() => expect(events).toEqual(['start 0']))
    releaseFirst()
    await upload

    expect(events.slice(0, 2)).toEqual(['start 0', 'end 0'])
  })

  it('sends every block once as raw bytes, in 8 MB slices, under one package id', async () => {
    const sent = []
    const post = host(true, (url, body) => {
      sent.push({
        id: queryOf(url).get('packageId'),
        index: Number(queryOf(url).get('index')),
        body,
      })
    })
    const progress = vi.fn()

    const result = await uploadIntuneWinPayload({
      payload: payloadOf(2.5),
      post,
      onProgress: progress,
    })

    expect(result.blockCount).toBe(3)
    expect(sent.map((s) => s.index).sort()).toEqual([0, 1, 2])
    expect(
      sent.every(
        (s) =>
          s.body instanceof Blob && s.body.type === 'application/octet-stream'
      )
    ).toBe(true)
    expect(sent.find((s) => s.index === 2).body.size).toBe(
      PACKAGE_BLOCK_BYTES / 2
    )
    expect(new Set(sent.map((s) => s.id))).toEqual(new Set([result.packageId]))
    expect(progress).toHaveBeenLastCalledWith(100)
  })

  it('sends base64 JSON blocks when the host cannot take raw bodies', async () => {
    const payload = new Blob([new Uint8Array([1, 2, 3, 250])])
    const sent = []
    const post = host(false, (url, body) => {
      sent.push({ url, body })
    })

    const result = await uploadIntuneWinPayload({ payload, post })

    expect(sent).toHaveLength(1)
    expect(sent[0].url).toBe('/api/ExecUploadAppPackage')
    expect(sent[0].body).toEqual({
      packageId: result.packageId,
      index: 0,
      data: 'AQID+g==',
    })
  })

  it('fails the upload when a block fails', async () => {
    const post = host(true, (url) => {
      if (url.includes('index=2')) throw new Error('500 from storage')
    })

    await expect(
      uploadIntuneWinPayload({ payload: payloadOf(4), post })
    ).rejects.toThrow('500 from storage')
  })
})

describe('readMsiProperties', () => {
  it('reads the Property table of an MSI created by Windows Installer', async () => {
    const properties = await readMsiProperties(
      new Blob([Buffer.from(msiSample, 'base64')])
    )

    expect(properties).toEqual({
      ProductCode: '{11111111-2222-3333-4444-555555555555}',
      ProductVersion: '1.2.3',
      UpgradeCode: '{66666666-7777-8888-9999-000000000000}',
      Manufacturer: 'Contoso',
      ProductName: 'Contoso Tool',
      ALLUSERS: '1',
    })
  })

  it('refuses a file that is not an MSI', async () => {
    await expect(readMsiProperties(sampleFile())).rejects.toThrow(
      'not an MSI package'
    )
  })

  it.each([
    ['1', 'System'],
    ['2', 'Any'],
    [undefined, 'User'],
  ])('maps ALLUSERS=%s to the %s install context', (allUsers, context) => {
    expect(
      msiInfoFromProperties({ ProductCode: '{X}', ALLUSERS: allUsers })
        .MsiExecutionContext
    ).toBe(context)
  })
})

describe('packageInstaller', () => {
  const installer = new File([new Uint8Array(10)], 'setup.msi')
  const host = (statuses) => {
    const calls = []
    const post = vi.fn(async (url, body) => {
      calls.push({ url, body })
      if (body?.capabilities)
        return { data: { Results: { binaryBlocks: true } } }
      if (body?.status) return { data: { Results: statuses.shift() } }
      return {}
    })
    return { post, calls }
  }

  it('uploads the installer, queues packaging and waits for the result', async () => {
    const metadata = { SetupFile: 'setup.msi', EncryptedSize: 90 }
    const { post, calls } = host([
      { packaging: true },
      { blockCount: 2, metadata },
    ])
    const onPackaging = vi.fn()

    const result = await packageInstaller({
      file: installer,
      post,
      onPackaging,
      pollMs: 0,
    })

    const block = calls.find((c) => c.url.includes('index=0'))
    expect(block.url).toContain('installer=true')
    const queued = calls.find((c) => c.body?.package)
    expect(queued.body).toEqual({
      packageId: result.packageId,
      package: { setupFile: 'setup.msi', blockCount: 1 },
    })
    expect(calls.indexOf(queued)).toBeGreaterThan(calls.indexOf(block))
    expect(onPackaging).toHaveBeenCalledOnce()
    expect(calls.filter((c) => c.body?.status)).toHaveLength(2)
    expect(result).toEqual({
      packageId: result.packageId,
      blockCount: 2,
      metadata,
    })
  })

  it('fails with the packaging error', async () => {
    const { post } = host([{ error: 'Could not package setup.msi: boom' }])

    await expect(
      packageInstaller({ file: installer, post, pollMs: 0 })
    ).rejects.toThrow('Could not package setup.msi: boom')
  })

  it('refuses an installer of 4 GB or more before uploading it', async () => {
    const { post } = host([])

    await expect(
      packageInstaller({
        file: { name: 'big.exe', size: MAX_PACKAGE_BYTES + 1 },
        post,
      })
    ).rejects.toThrow('smaller than 4 GB')
    expect(post).not.toHaveBeenCalled()
  })
})
