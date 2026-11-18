import { describe, it, expect, vi } from 'vitest'
import { createHash } from 'node:crypto'
import {
  readIntuneWinPackage,
  uploadIntuneWinPayload,
  PACKAGE_BLOCK_BYTES,
} from '../../src/utils/intunewin-package'
import { intuneWinAppUtilSample } from '../mocks/intunewin-sample'

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
