import {
  DEFAULT_PAGE_SETTINGS,
  fromReportSettings,
  resolveBranding,
  resolvePresetId,
  serialiseBlock,
  toReportSettings,
} from '../../../src/components/ReportBuilder/reportSettings'

// Page setup is stored on the template and re-read into the form, so the two conversions have to be
// exact inverses. When they are not, a setting appears to save and then comes back wrong on reload —
// which is indistinguishable from it not having saved at all.

describe('toReportSettings', () => {
  it('unwraps autoComplete option objects to their values', () => {
    const settings = toReportSettings({
      size: { label: 'Letter', value: 'LETTER' },
      orientation: { label: 'Landscape', value: 'landscape' },
    })
    expect(settings.size).toBe('LETTER')
    expect(settings.orientation).toBe('landscape')
  })

  it('accepts bare strings as well as option objects', () => {
    const settings = toReportSettings({ size: 'A3', orientation: 'landscape' })
    expect(settings.size).toBe('A3')
    expect(settings.orientation).toBe('landscape')
  })

  it('falls back to A4 portrait when nothing is set', () => {
    const settings = toReportSettings({})
    expect(settings.size).toBe('A4')
    expect(settings.orientation).toBe('portrait')
  })

  it('carries the paper and the branding, and nothing else', () => {
    // A template used to be able to override the cover, footer and watermark on top of its preset,
    // which meant the branding page could show one thing and the report produce another. Those are
    // branding decisions and the preset states them; a template now says only which branding to use.
    expect(Object.keys(toReportSettings({})).sort()).toEqual([
      'brandingPresetId',
      'orientation',
      'size',
    ])
  })

  it('drops overrides a template saved before that change', () => {
    // Stored keys are ignored rather than migrated, so an old template renders exactly as its
    // preset says instead of silently keeping a setting nobody can see.
    const settings = toReportSettings({
      size: 'A4',
      footerText: 'Internal use only',
      watermarkText: 'DRAFT',
      coverEnabled: false,
    })
    expect(settings.footerText).toBeUndefined()
    expect(settings.watermarkText).toBeUndefined()
    expect(settings.coverEnabled).toBeUndefined()
  })

  it('reports no preset as an empty id', () => {
    expect(toReportSettings({}).brandingPresetId).toBe('')
  })

  it('unwraps a chosen preset', () => {
    expect(
      toReportSettings({ brandingPresetId: { label: 'Client', value: 'p1' } }).brandingPresetId
    ).toBe('p1')
  })
})

describe('fromReportSettings', () => {
  it('returns the defaults for a template saved before page setup existed', () => {
    expect(fromReportSettings(null)).toEqual(DEFAULT_PAGE_SETTINGS)
  })

  it('round-trips through toReportSettings without drift', () => {
    const original = { size: 'LETTER', orientation: 'landscape', brandingPresetId: 'p1' }
    const presets = [{ id: 'p1', name: 'Client Facing' }]

    expect(toReportSettings(fromReportSettings(original, presets))).toEqual(original)
  })

  it('round-trips a template using the default branding', () => {
    const original = { size: 'A4', orientation: 'portrait', brandingPresetId: '' }
    expect(toReportSettings(fromReportSettings(original))).toEqual(original)
  })

  it('reads an older template as its paper and preset alone', () => {
    // The overrides it still carries are not loaded back into the form, so re-saving it drops
    // them rather than writing them out again.
    const stored = {
      size: 'LETTER',
      orientation: 'landscape',
      brandingPresetId: 'p1',
      coverEnabled: false,
      coverLabel: 'QUARTERLY REVIEW',
      footerText: 'Contoso — [date]',
      showFooter: false,
      watermarkText: 'DRAFT',
      watermarkEnabled: true,
    }
    expect(toReportSettings(fromReportSettings(stored, [{ id: 'p1', name: 'Client Facing' }]))).toEqual(
      { size: 'LETTER', orientation: 'landscape', brandingPresetId: 'p1' }
    )
  })

  it('shows a chosen preset by name', () => {
    const form = fromReportSettings({ brandingPresetId: 'p1' }, [{ id: 'p1', name: 'Client Facing' }])
    expect(form.brandingPresetId).toEqual({ label: 'Client Facing', value: 'p1' })
  })

  it('keeps a deleted preset id so saving does not silently drop it', () => {
    const form = fromReportSettings({ brandingPresetId: 'gone' }, [])
    expect(form.brandingPresetId.value).toBe('gone')
    expect(form.brandingPresetId.label).toBe('Missing preset')
  })

  it('falls back to a known page size when the stored one is unrecognised', () => {
    expect(fromReportSettings({ size: 'B7' }).size.value).toBe('A4')
  })

  it('offers the form nothing but the paper and the branding', () => {
    // The page-setup card renders exactly these three controls; a field here that it does not show
    // is a setting nobody can see but that still saves.
    expect(Object.keys(fromReportSettings({})).sort()).toEqual([
      'brandingPresetId',
      'orientation',
      'size',
    ])
  })
})

describe('resolveBranding', () => {
  const global = { colour: '#F77F00' }
  const presets = [{ id: 'p1', colour: '#342858' }]

  it('uses the global settings when no preset is chosen', () => {
    expect(resolveBranding(global, presets, '')).toBe(global)
  })

  it('uses the chosen preset', () => {
    expect(resolveBranding(global, presets, 'p1')).toBe(presets[0])
  })

  it('falls back to global when the preset has been deleted', () => {
    expect(resolveBranding(global, presets, 'gone')).toBe(global)
  })

  it('survives the preset list not having loaded yet', () => {
    expect(resolveBranding(global, undefined, 'p1')).toBe(global)
  })
})

describe('resolvePresetId', () => {
  const branding = { reportDefaults: { executive: 'p-exec', reportBuilder: 'p-builder' } }

  it("lets the template's own choice win over the per-report default", () => {
    expect(resolvePresetId('p-template', branding, 'reportBuilder')).toBe('p-template')
  })

  it('falls back to the per-report default when the template chose nothing', () => {
    expect(resolvePresetId('', branding, 'reportBuilder')).toBe('p-builder')
  })

  it('picks the default for the right report type', () => {
    expect(resolvePresetId('', branding, 'executive')).toBe('p-exec')
  })

  it('resolves to the default branding when that report type has no default preset', () => {
    expect(resolvePresetId('', branding, 'sharing')).toBe('')
  })

  it('survives branding not having loaded yet', () => {
    expect(resolvePresetId('', undefined, 'executive')).toBe('')
    expect(resolvePresetId('', {}, 'executive')).toBe('')
  })
})

describe('what the not-a-preset option is called', () => {
  it('matches what the branding page calls it', async () => {
    // The branding page labels this scope "Default". The report dropdowns called the same thing
    // "Global branding settings", so whether an operator met it on the settings page or in a
    // report decided what it was named. One constant now, and both read it.
    const { DEFAULT_BRANDING_OPTION } = await import(
      '../../../src/components/ReportBuilder/reportSettings'
    )
    expect(DEFAULT_BRANDING_OPTION).toEqual({ label: 'Default', value: '' })
  })

  it('is not spelled out a second time anywhere', async () => {
    // The executive report used to carry its own copy of the option, which is how the two drifted.
    const { readFileSync } = await import('node:fs')
    for (const file of [
      'src/components/ExecutiveReportButton.js',
      'src/pages/tools/report-builder/builder/index.js',
      'src/components/CippSettings/CippBrandingSettings.jsx',
    ]) {
      const source = readFileSync(file, 'utf8').replace(/\/\/[^\n]*/g, '')
      expect(source, `${file} names the default branding option itself`).not.toMatch(
        /label:\s*['"]Global branding/i
      )
    }
  })
})

describe('serialiseBlock', () => {
  it('keeps chart data through a save', () => {
    const saved = serialiseBlock({
      type: 'chart',
      title: 'Compliance',
      chartKind: 'donut',
      chartData: [{ label: 'Compliant', value: 42 }],
      chartCentreLabel: 'Devices',
    })
    expect(saved.chartKind).toBe('donut')
    expect(saved.chartData).toEqual([{ label: 'Compliant', value: 42 }])
    expect(saved.chartCentreLabel).toBe('Devices')
  })

  it('keeps scorecard and progress rows', () => {
    expect(serialiseBlock({ type: 'scorecard', stats: [{ label: 'Users', value: '5' }] }).stats)
      .toHaveLength(1)
    expect(serialiseBlock({ type: 'progress', items: [{ label: 'MFA', value: 90 }] }).items)
      .toHaveLength(1)
  })

  it('keeps hero fields', () => {
    const saved = serialiseBlock({
      type: 'hero',
      title: 'Findings',
      heroHighlight: '83%',
      heroImage: '/reportImages/board.jpg',
    })
    expect(saved.heroHighlight).toBe('83%')
    expect(saved.heroImage).toBe('/reportImages/board.jpg')
  })

  it('drops the content of a live test block so it refreshes on the next render', () => {
    expect(serialiseBlock({ type: 'test', static: false, content: 'stale' }).content).toBeNull()
  })

  it('keeps the content of an edited test block', () => {
    expect(serialiseBlock({ type: 'test', static: true, content: 'edited' }).content).toBe('edited')
  })

  it('marks custom and database blocks static, since their content is not re-fetched', () => {
    expect(serialiseBlock({ type: 'blank', content: '<p>x</p>' }).static).toBe(true)
    expect(serialiseBlock({ type: 'database', content: '|a|' }).static).toBe(true)
  })

  it('does not carry chart fields on a block that has none', () => {
    const saved = serialiseBlock({ type: 'blank', content: '<p>x</p>' })
    expect(saved.chartData).toBeNull()
    expect(saved.stats).toBeNull()
  })
})
