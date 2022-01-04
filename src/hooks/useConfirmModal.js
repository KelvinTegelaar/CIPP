import React from 'react'
import { useDispatch } from 'react-redux'
import { setModalContent } from '../store/features/modal'

export default function useConfirmModal({
  body,
  onConfirm = () => {},
  confirmLabel = 'Continue',
  cancelLabel = 'Cancel',
}) {
  const dispatch = useDispatch()

  const showModal = () =>
    dispatch(
      setModalContent({
        componentType: 'confirm',
        title: 'Confirm',
        body: <div>{body}</div>,
        onConfirm,
        confirmLabel,
        cancelLabel,
        visible: true,
        size: 'xl',
      }),
    )

  return showModal
}
