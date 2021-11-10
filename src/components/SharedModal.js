import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { CButton, CModal, CModalBody, CModalFooter, CModalHeader, CModalTitle } from '@coreui/react'
import { hideModal } from '../store/modules/modal'

export default function SharedModal() {
  const { body, title, visible } = useSelector((store) => store.modal)
  const dispatch = useDispatch()

  const hideAction = () => dispatch(hideModal())

  return (
    <CModal scrollable visible={visible} onClose={hideAction}>
      <CModalHeader onClose={hideAction}>
        <CModalTitle>{title}</CModalTitle>
      </CModalHeader>
      <CModalBody>{body}</CModalBody>
      <CModalFooter>
        <CButton color="primary" onClick={hideAction}>
          Close
        </CButton>
      </CModalFooter>
    </CModal>
  )
}
