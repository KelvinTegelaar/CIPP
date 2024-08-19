import React, { useRef, useState } from 'react'
import {
  CButton,
  CCallout,
  CCol,
  CForm,
  CRow,
  CAccordion,
  CAccordionHeader,
  CAccordionBody,
  CAccordionItem,
} from '@coreui/react'
import { Field, Form, FormSpy } from 'react-final-form'
import { RFFCFormRadioList, RFFSelectSearch } from 'src/components/forms'
import { useGenericGetRequestQuery, useLazyGenericPostRequestQuery } from 'src/store/api/app'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { TenantSelectorMultiple, ModalService, CippOffcanvas } from 'src/components/utilities'
import PropTypes from 'prop-types'
import { OnChange } from 'react-final-form-listeners'
import { useListTenantsQuery } from 'src/store/api/tenants'
import { OffcanvasListSection } from 'src/components/utilities/CippListOffcanvas'
import CippButtonCard from 'src/components/contentcards/CippButtonCard'
import CippAppPermissionBuilder from 'src/components/utilities/CippAppPermissionBuilder'

const SettingsAppPermissions = () => {
  const [genericPostRequest, postResults] = useLazyGenericPostRequestQuery()
  const handleSubmit = (values) => {
    genericPostRequest({
      path: 'api/ExecSAMAppPermissions?Action=Update',
      values: values,
    }).then(() => {
      refetchSam()
    })
  }

  const {
    data: samAppPermissions = [],
    isFetching: samAppPermissionsFetching,
    refetch: refetchSam,
  } = useGenericGetRequestQuery({
    path: 'api/ExecSAMAppPermissions',
  })

  return (
    <CippButtonCard title="CIPP-SAM API Permissions" titleType="big">
      <>
        <p className="me-1">Manage the permissions for the CIPP-SAM App Registration and CPV.</p>
        <p className="small">
          <FontAwesomeIcon icon="triangle-exclamation" className="me-2" /> This functionality is in
          beta and should be treated as such. Removing permissions from the CIPP-SAM App is not
          advised.
        </p>

        <CippAppPermissionBuilder
          onSubmit={handleSubmit}
          currentPermissions={samAppPermissions}
          isSubmitting={postResults.isFetching}
        />

        {postResults.data && (
          <CCallout color="success" className="mt-3">
            {postResults?.data?.Results}
          </CCallout>
        )}
      </>
    </CippButtonCard>
  )
}

export default SettingsAppPermissions
