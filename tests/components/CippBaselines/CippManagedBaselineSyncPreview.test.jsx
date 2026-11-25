import React, { useEffect } from 'react'
import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useForm } from 'react-hook-form'
import { renderWithProviders } from '../../test-utils'

vi.mock('../../../src/api/ApiCall', async () =>
  (await import('../../mocks/api-call')).apiCallMock()
)
import { api, postResult } from '../../mocks/api-call'
import { CippManagedBaselineSyncPreview } from '../../../src/components/CippBaselines/CippManagedBaselineSyncPreview'

const item = (key, label, extra = {}) => ({
  key,
  label,
  standard: key,
  stage: 'Baseline',
  changes: [],
  ...extra,
})

const previewOf = (metadata) =>
  postResult({
    isSuccess: true,
    data: {
      data: {
        Results: 'ok',
        Metadata: { currentVersion: '1', newVersion: '2', ...metadata },
      },
    },
  })

// Owns the form the action dialog would own, and hands it to the test that asks for it.
const Harness = ({ action, onForm }) => {
  const form = useForm()
  useEffect(() => {
    onForm?.(form)
  }, [form, onForm])
  return (
    <CippManagedBaselineSyncPreview
      formHook={form}
      row={{ GUID: 'baseline-1' }}
      action={action}
    />
  )
}

describe('CippManagedBaselineSyncPreview', () => {
  it('asks the endpoint what the action would change for this baseline', () => {
    api.post = previewOf({})
    renderWithProviders(<Harness action="Merge" />)

    expect(api.post.mutate).toHaveBeenCalledWith({
      url: '/api/ExecManagedBaseline',
      data: { Action: 'Merge', GUID: 'baseline-1', Preview: true },
    })
  })

  it('lists CyberDrain-only standards unticked for Merge and posts only the ticked ones', async () => {
    const user = userEvent.setup()
    api.post = previewOf({
      overwritten: [
        item('SmartLockout|1', 'Configure Smart Lockout', {
          changes: ['Settings', 'Automatic remediation: on to off'],
        }),
      ],
      available: [
        item('EnableFIDO2|1', 'Enable FIDO2'),
        item('PasswordExpireDisabled|1', 'Do not expire passwords'),
      ],
      kept: [item('DisableReshare|1', 'Disable Re-sharing')],
    })
    let form
    renderWithProviders(
      <Harness
        action="Merge"
        onForm={(hook) => {
          form = hook
        }}
      />
    )

    expect(screen.getByText('Configure Smart Lockout')).toBeInTheDocument()
    expect(
      screen.getByText('Settings, Automatic remediation: on to off')
    ).toBeInTheDocument()
    expect(screen.getByText(/1 of your own standard stays/)).toBeInTheDocument()
    const boxes = screen.getAllByRole('checkbox')
    expect(boxes).toHaveLength(2)
    boxes.forEach((box) => expect(box).not.toBeChecked())
    expect(form.getValues('Add')).toEqual([])

    await user.click(screen.getByRole('checkbox', { name: 'Add Enable FIDO2' }))

    expect(form.getValues('Add')).toEqual(['EnableFIDO2|1'])
  })

  it('lists what Align adds and removes, with nothing to tick', () => {
    api.post = previewOf({
      added: [item('EnableFIDO2|1', 'Enable FIDO2')],
      removed: [item('DisableReshare|1', 'Disable Re-sharing')],
      stages: { from: ['Baseline'], to: ['Baseline', 'Hardening'] },
      templates: ['Block legacy authentication'],
    })
    renderWithProviders(<Harness action="Align" />)

    expect(screen.getByText('Added')).toBeInTheDocument()
    expect(screen.getByText('Enable FIDO2')).toBeInTheDocument()
    expect(screen.getByText('Removed')).toBeInTheDocument()
    expect(screen.getByText('Disable Re-sharing')).toBeInTheDocument()
    expect(
      screen.getByText(/Stages change from Baseline to Baseline, Hardening/)
    ).toBeInTheDocument()
    expect(screen.getByText(/Block legacy authentication/)).toBeInTheDocument()
    expect(screen.queryAllByRole('checkbox')).toHaveLength(0)
  })

  it('says so when the baseline already matches', () => {
    api.post = previewOf({ unchanged: 6 })
    renderWithProviders(<Harness action="Align" />)

    expect(
      screen.getByText(/already matches CyberDrain's version/)
    ).toBeInTheDocument()
  })
})
