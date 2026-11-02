import React from 'react'
import { describe, it, expect } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { useForm } from 'react-hook-form'
import { renderWithProviders } from '../../test-utils'
import { CippBaselineStandardSettings } from '../../../src/components/CippBaselines/CippBaselineStandardSettings'

// Trimmed from backend/Config/BaselineStandards/Global Standards/AuditLog.json.
const auditLogStandard = {
  name: 'AuditLog',
  variables: {
    enabled: {
      type: 'switch',
      label: 'Unified Audit Log ingestion enabled',
      default: true,
      recommended: true,
      locked: true,
    },
  },
}

const Harness = ({ initialValues, valuesRef }) => {
  const formControl = useForm({ mode: 'onBlur' })
  React.useEffect(() => {
    valuesRef.current = () => formControl.getValues('settings.AuditLog')
  })
  return (
    <CippBaselineStandardSettings
      standard={auditLogStandard}
      formControl={formControl}
      namePrefix="settings.AuditLog"
      initialValues={initialValues}
    />
  )
}

describe('CippBaselineStandardSettings locked variables', () => {
  it('shows a locked switch at its definition value, not a saved one', async () => {
    const valuesRef = {}
    renderWithProviders(
      <Harness initialValues={{ enabled: false }} valuesRef={valuesRef} />
    )
    const toggle = screen.getByRole('switch', { name: /Unified Audit Log/ })
    await waitFor(() => expect(toggle).toBeChecked())
    expect(toggle).toBeDisabled()
    expect(valuesRef.current()).toEqual({ enabled: true })
  })
})
