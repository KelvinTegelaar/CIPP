import React from 'react'
import { screen } from '@testing-library/react'
import TimeAgo from 'javascript-time-ago'
import en from 'javascript-time-ago/locale/en'
try { TimeAgo.addDefaultLocale(en) } catch (e) { /* already added */ }
import { renderWithTheme } from '../../test-utils'
import { CippTimeAgo } from '../../../src/components/CippComponents/CippTimeAgo'

describe('CippTimeAgo', () => {
  it('renders "Never" when data is 0 (epoch zero)', () => {
    renderWithTheme(<CippTimeAgo data={0} />)
    expect(screen.getByText('Never')).toBeInTheDocument()
  })

  it('renders "No Data" text for invalid date with type="text"', () => {
    renderWithTheme(<CippTimeAgo data="not-a-date" type="text" />)
    expect(screen.getByText('No Data')).toBeInTheDocument()
  })

  it('renders "No Data" Chip for invalid date with type="chip"', () => {
    renderWithTheme(<CippTimeAgo data="not-a-date" type="chip" />)
    const chip = screen.getByText('No Data')
    expect(chip).toBeInTheDocument()
    // Chip renders its label inside a span within the chip root
    expect(chip.closest('.MuiChip-root')).toBeInTheDocument()
  })

  it('renders "1 hour ago" for a date one hour in the past', () => {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    renderWithTheme(<CippTimeAgo data={oneHourAgo} />)
    expect(screen.getByText(/1 hour ago/)).toBeInTheDocument()
  })

  it('renders "1 day ago" for a unix-seconds timestamp one day in the past', () => {
    const oneDayAgoUnix = Math.floor((Date.now() - 24 * 60 * 60 * 1000) / 1000)
    renderWithTheme(<CippTimeAgo data={oneDayAgoUnix} />)
    expect(screen.getByText(/1 day ago/)).toBeInTheDocument()
  })
})
