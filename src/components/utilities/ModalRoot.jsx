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
          body: typeof body === 'function' ? body() : body,
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
    this.open({
      componentType: 'confirm',
      body: typeof body === 'function' ? body : body,
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
  const [version, setVersion] = useState(0) // used to force re-render

  useEffect(() => {
    const handleOpen = (props) => {
      setModal({
        ...props,
        close: () => {
          setModal({})
        },
      })
      setVersion((v) => v + 1) // Increment version to force update
    }

    ModalService.on('open', handleOpen)
    return () => {
      document.removeEventListener('open', handleOpen)
    }
  }, [])

  const ModalComponent = modal.componentType ? SharedModal : null

  return (
    <>
      {ModalComponent && (
        <ModalComponent
          key={version} // Use key to force re-render on changes
          {...modal}
          visible
          close={modal.close}
        />
      )}
    </>
  )
}
