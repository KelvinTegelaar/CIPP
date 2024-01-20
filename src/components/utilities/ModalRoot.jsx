import React, { useEffect, useState } from 'react'
import { SharedModal } from 'src/components/utilities'

export const ModalService = {
  on(event, callback) {
    document.addEventListener(event, (e) => callback(e.detail))
  },
  open({
    componentType = 'text',
    componentProps = {},
    body = false,
    data,
    title,
    size,
    onConfirm = () => {},
    onClose = () => {},
    ...rest
  }) {
    document.dispatchEvent(
      new CustomEvent('open', {
        detail: {
          componentType,
          componentProps,
          body,
          data,
          title,
          size,
          onConfirm,
          onClose,
          ...rest,
        },
      }),
    )
  },
  confirm({ body, title, size, onConfirm, confirmLabel, cancelLabel }) {
    ModalService.open({
      componentType: 'confirm',
      body,
      title,
      size,
      onConfirm,
      confirmLabel,
      cancelLabel,
    })
  },
}

export function ModalRoot() {
  const [modal, setModal] = useState({})

  useEffect(() => {
    ModalService.on('open', (props) => {
      setModal({
        ...props,
        close: () => {
          setModal({})
        },
      })
    })
  }, [])

  const ModalComponent = modal.body || modal.data ? SharedModal : null

  return <>{ModalComponent && <ModalComponent {...modal} visible close={modal.close} />}</>
}
