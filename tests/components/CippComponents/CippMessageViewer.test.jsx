import React from 'react'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '../../test-utils'
import { CippMessageViewer } from '../../../src/components/CippComponents/CippMessageViewer'
import TimeAgo from 'javascript-time-ago'
import en from 'javascript-time-ago/locale/en'

try {
  TimeAgo.addDefaultLocale(en)
} catch (e) {
  /* already added */
}

const eml = [
  'From: Sender <sender@contoso.example>',
  'To: User <user@fabrikam.example>',
  'Subject: Statement',
  'Date: Thu, 10 Sep 2026 10:00:00 +0000',
  'MIME-Version: 1.0',
  'Content-Type: multipart/mixed; boundary="b1"',
  '',
  '--b1',
  'Content-Type: text/plain; charset="utf-8"',
  '',
  'See attached.',
  '--b1',
  'Content-Type: application/pdf; name="=?Windows-1252?Q?2024.11.08_-_Statement_of_Account.pdf?="',
  'Content-Disposition: attachment;',
  ' filename="=?Windows-1252?Q?2024.11.08_-_Statement_of_Account.pdf?="',
  'Content-Transfer-Encoding: base64',
  '',
  'JVBERi0xLjQK',
  '--b1',
  'Content-Type: image/png; name="image001.png"',
  'Content-Disposition: inline; filename="image001.png"',
  'Content-Transfer-Encoding: base64',
  '',
  'iVBORw0KGgo=',
  '--b1--',
  '',
].join('\r\n')

describe('CippMessageViewer attachments', () => {
  it('shows decoded file names in a wrapping row', async () => {
    renderWithProviders(<CippMessageViewer emailSource={eml} />)

    const decoded = await screen.findByText('2024.11.08 - Statement of Account.pdf')
    expect(decoded).toBeInTheDocument()
    expect(screen.queryByText(/=\?Windows-1252\?/)).toBeNull()

    const button = decoded.closest('button')
    expect(button).not.toBeNull()
    expect(getComputedStyle(button.parentElement).flexWrap).toBe('wrap')
    expect(screen.getByText('image001.png').closest('button')).toBeInTheDocument()
  })
})
