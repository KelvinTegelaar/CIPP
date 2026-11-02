import React, { useEffect, useState } from 'react'
import { describe, it, expect, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useForm } from 'react-hook-form'
import { renderWithProviders } from '../../test-utils'
import CippStandardAccordion from '../../../src/components/CippStandards/CippStandardAccordion'
import standardsData from '../../../src/data/standards.json'

vi.mock('../../../src/api/ApiCall', async () => (await import('../../mocks/api-call')).apiCallMock())
import { api, getResult, paginatedResult, postResult } from '../../mocks/api-call'

api.get = getResult({ isSuccess: false })
api.post = postResult()
api.paginated = paginatedResult([], { isSuccess: false, data: undefined })

const REPORT = { label: 'Report', value: 'Report' }
const REMEDIATE = { label: 'Remediate', value: 'Remediate' }

// real entries from data/standards.json (the shipped producer, template.jsx passes it verbatim):
// AddDMARCToMOERA disables remediate, AuditLog allows everything, SPDirectSharing is deprecated,
// CustomBannedPasswordList has a required textField (component.name is the full doubled path)
const BANNED_PATH =
  'standards.CustomBannedPasswordList.standards.CustomBannedPasswordList.BannedWords'

let capturedForm

const Harness = ({ selected, defaultValues, editMode = false }) => {
  const formControl = useForm({ mode: 'onBlur', defaultValues })
  // react-hooks lint rejects outer reassignment in component bodies, assign in an effect
  useEffect(() => {
    capturedForm = formControl
  }, [formControl])
  const [expanded, setExpanded] = useState(null)
  return (
    <CippStandardAccordion
      standards={standardsData}
      selectedStandards={selected}
      expanded={expanded}
      handleAccordionToggle={(name) => setExpanded((prev) => (prev === name ? null : name))}
      handleRemoveStandard={() => {}}
      handleAddMultipleStandard={() => {}}
      formControl={formControl}
      editMode={editMode}
    />
  )
}

// open the Set All Actions menu, toggle the given checkboxes, apply, wait for menu close
const applyBulkActions = async (user, labels) => {
  await user.click(screen.getByRole('button', { name: 'Set All Actions' }))
  for (const label of labels) {
    await user.click(await screen.findByRole('menuitem', { name: label }))
  }
  await user.click(screen.getByRole('menuitem', { name: 'Apply to all standards' }))
  await waitFor(() => {
    expect(screen.queryByRole('menuitem', { name: 'Apply to all standards' })).not.toBeInTheDocument()
  })
}

describe('CippStandardAccordion Set All Actions', () => {
  it('bulk apply intersects picked actions with each standard availability, Remediate never lands on a remediate-disabled standard', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <Harness selected={{ 'standards.AddDMARCToMOERA': true, 'standards.AuditLog': true }} />,
    )

    await applyBulkActions(user, ['Report', 'Remediate'])

    expect(capturedForm.getValues('standards.AuditLog.action')).toEqual([REPORT, REMEDIATE])
    // disabledFeatures.remediate strips Remediate for this standard
    expect(capturedForm.getValues('standards.AddDMARCToMOERA.action')).toEqual([REPORT])
  })

  it('bulk apply skips a standard entirely when no picked action is available, no empty action written', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <Harness selected={{ 'standards.AddDMARCToMOERA': true, 'standards.AuditLog': true }} />,
    )

    await applyBulkActions(user, ['Remediate'])

    expect(capturedForm.getValues('standards.AuditLog.action')).toEqual([REMEDIATE])
    expect(capturedForm.getValues('standards.AddDMARCToMOERA.action')).toBeUndefined()
  })

  it('bulk apply never writes actions onto deprecated or unknown standards', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <Harness
        selected={{
          'standards.SPDirectSharing': true,
          'standards.GhostStandardRemovedFromCatalog': true,
          'standards.AuditLog': true,
        }}
      />,
    )

    await applyBulkActions(user, ['Report'])

    expect(capturedForm.getValues('standards.AuditLog.action')).toEqual([REPORT])
    expect(capturedForm.getValues('standards.SPDirectSharing.action')).toBeUndefined()
    expect(capturedForm.getValues('standards.GhostStandardRemovedFromCatalog.action')).toBeUndefined()
  })

  it('bulk apply keeps previously saved fields, configured standard stays configured', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <Harness
        selected={{ 'standards.CustomBannedPasswordList': true }}
        editMode={true}
        defaultValues={{
          standards: {
            CustomBannedPasswordList: {
              action: [{ label: 'Alert', value: 'warn' }],
              standards: { CustomBannedPasswordList: { BannedWords: 'hunter2;correcthorse' } },
            },
          },
        }}
      />,
    )

    // edit-mode init derives configured state from the loaded template
    expect(await screen.findByText('Configured')).toBeInTheDocument()

    await applyBulkActions(user, ['Report'])

    expect(capturedForm.getValues('standards.CustomBannedPasswordList.action')).toEqual([REPORT])
    // bulk apply only touches .action, the saved required field survives in form and savedValues
    expect(capturedForm.getValues(BANNED_PATH)).toBe('hunter2;correcthorse')
    expect(screen.getByText('Configured')).toBeInTheDocument()
    expect(screen.queryByText('Unconfigured')).not.toBeInTheDocument()
  })

  it('bulk apply leaves unsaved field edits alone, cancel restores saved fields plus the bulk action', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <Harness
        selected={{ 'standards.CustomBannedPasswordList': true }}
        editMode={true}
        defaultValues={{
          standards: {
            CustomBannedPasswordList: {
              action: [{ label: 'Alert', value: 'warn' }],
              standards: { CustomBannedPasswordList: { BannedWords: 'hunter2;correcthorse' } },
            },
          },
        }}
      />,
    )
    expect(await screen.findByText('Configured')).toBeInTheDocument()

    // expand toggle is the unnamed icon button after the tooltip-labeled remove button
    const expandBtn = screen.getByRole('button', { name: 'Remove Standard' }).nextElementSibling
    await user.click(expandBtn)
    await user.type(screen.getByRole('textbox', { name: 'Banned Words' }), ';extra')
    expect(capturedForm.getValues(BANNED_PATH)).toBe('hunter2;correcthorse;extra')

    await applyBulkActions(user, ['Report'])

    // apply collapsed the accordion but the unsaved edit stays in the form
    await waitFor(() => {
      expect(screen.queryByRole('textbox', { name: 'Banned Words' })).not.toBeInTheDocument()
    })
    expect(capturedForm.getValues(BANNED_PATH)).toBe('hunter2;correcthorse;extra')

    // cancel reverts to savedValues: original field, bulk-applied action
    await user.click(expandBtn)
    await user.click(await screen.findByRole('button', { name: 'Cancel' }))
    expect(capturedForm.getValues(BANNED_PATH)).toBe('hunter2;correcthorse')
    expect(capturedForm.getValues('standards.CustomBannedPasswordList.action')).toEqual([REPORT])
  })
})
