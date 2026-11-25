import { render } from '@testing-library/react'
import { expect, it, vi } from 'vitest'
import Page from '../../src/pages/security/defender/devices'
import { CippTablePage } from '../../src/components/CippComponents/CippTablePage.jsx'

vi.mock('../../src/layouts/index', () => ({ Layout: vi.fn() }))
vi.mock('../../src/hooks/use-permissions', () => ({
  usePermissions: () => ({ checkPermissions: () => false }),
}))
vi.mock('../../src/components/CippComponents/CippReportDBControls', () => ({
  useCippReportDB: () => ({ cacheColumns: [] }),
}))
vi.mock('../../src/components/CippComponents/CippTablePage.jsx', () => ({
  CippTablePage: vi.fn(() => null),
}))

it('matches Passive exactly so the preset excludes Passive Audit', () => {
  render(<Page />)
  const { filters } = CippTablePage.mock.calls[0][0]
  expect(
    filters.find(({ filterName }) => filterName === 'Antivirus passive')
  ).toMatchObject({
    filterType: 'equal',
    value: [{ id: 'avMode', value: 'Passive' }],
  })
})
