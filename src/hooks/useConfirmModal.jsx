import React from 'react'
import { ModalService } from 'src/components/utilities'

export default function useConfirmModal({
  body,
  onConfirm = () => {},
  confirmLabel = 'Continue',
  cancelLabel = 'Cancel',
}) {
  const showModal = () =>
    ModalService.confirm({
      title: 'Confirm',
      body: <div>{body}</div>,
      onConfirm,
      confirmLabel,
      cancelLabel,
      size: 'xl',
    })

  return showModal
}
