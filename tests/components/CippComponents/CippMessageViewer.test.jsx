import React from 'react'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '../../test-utils'
import { CippMessageViewer } from '../../../src/components/CippComponents/CippMessageViewer'
import {
  quarantineTnefMessage,
  tnefBytes,
} from '../../mocks/quarantine-tnef-message'
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

const tnefBase64 = btoa(String.fromCharCode(...tnefBytes)).replace(
  /(.{76})/g,
  '$1\r\n'
)
const outlookRichText = [
  'From: Sender <sender@contoso.example>',
  'To: User <user@fabrikam.example>',
  'Subject: Rich text',
  'Date: Thu, 22 Oct 2026 10:00:00 +0000',
  'MIME-Version: 1.0',
  'Content-Type: multipart/mixed; boundary="b1"',
  '',
  '--b1',
  'Content-Type: text/plain; charset="utf-8"',
  '',
  'See attached.',
  '--b1',
  'Content-Type: application/ms-tnef; name="winmail.dat"',
  'Content-Disposition: attachment; filename="winmail.dat"',
  'Content-Transfer-Encoding: base64',
  '',
  tnefBase64,
  '--b1--',
  '',
].join('\r\n')

describe('CippMessageViewer winmail.dat', () => {
  it('shows the body and files of a quarantine export that is one binary TNEF part', async () => {
    renderWithProviders(
      <CippMessageViewer
        emailSource={quarantineTnefMessage.Message}
        emlBase64={quarantineTnefMessage.EmlBase64}
      />
    )

    expect(await screen.findByText('Invoice_2026-10.pdf')).toBeInTheDocument()
    expect(screen.getByText('ViewDocument.html')).toBeInTheDocument()
    expect(screen.queryByText('winmail.dat')).toBeNull()
    expect(screen.getByText('Test message for issue 962.')).toBeInTheDocument()
  })

  it('expands a base64 winmail.dat attachment from an Outlook rich-text sender', async () => {
    renderWithProviders(<CippMessageViewer emailSource={outlookRichText} />)

    expect(await screen.findByText('Invoice_2026-10.pdf')).toBeInTheDocument()
    expect(screen.getByText('ViewDocument.html')).toBeInTheDocument()
    expect(screen.queryByText('winmail.dat')).toBeNull()
  })

  it('keeps winmail.dat when only the UTF-8 decoded export is available', async () => {
    renderWithProviders(
      <CippMessageViewer emailSource={quarantineTnefMessage.Message} />
    )

    expect(await screen.findByText('winmail.dat')).toBeInTheDocument()
  })
})
