import React from 'react'
import { Button } from '@mui/material'
import { Stack } from '@mui/system'
import { CippApiDialog } from '../CippComponents/CippApiDialog'
import { useDialog } from '../../hooks/use-dialog'
import { resolveRowTemplates } from '../../utils/resolve-row-templates'

const isActionConfig = (value) =>
  Boolean(value) &&
  typeof value === 'object' &&
  !React.isValidElement(value) &&
  !Array.isArray(value) &&
  (typeof value.url === 'string' || typeof value.link === 'string')

const CippTableActionButton = ({ action, row }) => {
  const createDialog = useDialog()

  if (typeof action.condition === 'function' && !action.condition(row)) {
    return null
  }

  return (
    <>
      <Button
        size="small"
        variant="contained"
        startIcon={action.icon ?? action.startIcon}
        onClick={createDialog.handleOpen}
      >
        {action.label}
      </Button>
      <CippApiDialog
        createDialog={createDialog}
        title={action.title ?? action.label}
        relatedQueryKeys={resolveRowTemplates(action.relatedQueryKeys, row)}
        row={row}
        fields={action.fields}
        allowResubmit={action.allowResubmit}
        api={{
          type: action.type ?? 'POST',
          url: action.url,
          confirmText: action.confirmText,
          data: action.data,
          customDataformatter: action.customDataformatter,
          replacementBehaviour: action.replacementBehaviour,
          multiPost: action.multiPost,
        }}
      />
    </>
  )
}

export const CippTableCardButton = ({ cardButton, row }) => {
  if (!cardButton) {
    return null
  }
  if (typeof cardButton === 'function') {
    return cardButton(row)
  }
  if (Array.isArray(cardButton)) {
    return (
      <Stack direction="row" spacing={1} sx={{
        alignItems: "center"
      }}>
        {cardButton.map((item, index) => (
          <CippTableCardButton key={item?.label ?? index} cardButton={item} row={row} />
        ))}
      </Stack>
    );
  }
  if (isActionConfig(cardButton)) {
    return <CippTableActionButton action={cardButton} row={row} />
  }
  return cardButton
}
