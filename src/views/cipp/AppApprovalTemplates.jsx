import React from 'react'
import {
  CCol,
  CRow,
  CCallout,
  CSpinner,
  CButton,
  CFormInput,
  CFormLabel,
  CTooltip,
} from '@coreui/react'
import { Field, Form, FormSpy } from 'react-final-form'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons'
import { CippPageList, CippWizard } from 'src/components/layout'
import { cellDateFormatter, CippTable, WizardTableField } from 'src/components/tables'
import PropTypes from 'prop-types'
import {
  Condition,
  RFFCFormCheck,
  RFFCFormInput,
  RFFCFormSwitch,
  RFFSelectSearch,
} from 'src/components/forms'
import { useLazyGenericPostRequestQuery } from 'src/store/api/app'
import CippButtonCard from 'src/components/contentcards/CippButtonCard'
import { cellGenericFormatter } from 'src/components/tables/CellGenericFormat'
import { CippOffcanvas } from 'src/components/utilities'
import CippAppPermissionBuilder from 'src/components/utilities/CippAppPermissionBuilder'

const AppApprovalTemplates = () => {
  const [editorVisible, setEditorVisible] = React.useState(false)
  const [selectedTemplate, setSelectedTemplate] = React.useState(null)
  const templateNameRef = React.useRef(null)
  const [genericPostRequest, postResults] = useLazyGenericPostRequestQuery()

  const onSubmit = (values) => {
    var body = {
      TemplateName: templateNameRef.current.value,
      Permissions: values.Permissions,
    }
    if (selectedTemplate?.TemplateId) {
      body.TemplateId = selectedTemplate.TemplateId
    }

    console.log(body)
    genericPostRequest({
      path: '/api/ExecAppPermissionTemplate?Action=Save',
      values: body,
    }).then(() => {})
  }
  const titleButton = (
    <CButton
      onClick={() => {
        setSelectedTemplate({})
        templateNameRef.current.value = ''
        setEditorVisible(true)
      }}
    >
      <FontAwesomeIcon icon="plus" /> Add Template
    </CButton>
  )
  return (
    <>
      <CippPageList
        capabilities={{ allTenants: true, helpContext: 'https://google.com' }}
        title="App Approval Templates"
        tenantSelector={false}
        titleButton={titleButton}
        datatable={{
          tableProps: {
            selectableRows: true,
          },
          path: '/api/ExecAppPermissionTemplate',
          columns: [
            {
              name: 'Name',
              selector: (row) => row['TemplateName'],
              sortable: true,
              exportSelector: 'TemplateName',
            },
            {
              name: 'Updated By',
              selector: (row) => row['UpdatedBy'],
              sortable: true,
              exportSelector: 'UpdatedBy',
            },
            {
              name: 'Updated At',
              selector: (row) => row['Timestamp'],
              sortable: true,
              exportSelector: 'Timestamp',
              cell: cellDateFormatter({ format: 'short' }),
            },
            {
              name: 'Actions',
              cell: (row) => (
                <CTooltip content="Edit Template">
                  <CButton
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setSelectedTemplate(row)
                      templateNameRef.current.value = row.TemplateName
                      setEditorVisible(true)
                    }}
                  >
                    <FontAwesomeIcon icon="edit" size="sm" />
                  </CButton>
                </CTooltip>
              ),
            },
          ],
          reportName: 'AppApprovalTemplates',
        }}
      />
      <CippOffcanvas
        title="Manage Template"
        addedClass="offcanvas-large"
        visible={editorVisible}
        placement="end"
        hideFunction={() => setEditorVisible(false)}
      >
        <CFormLabel>Template Name</CFormLabel>
        <CFormInput name="TemplateName" className="mb-3" ref={templateNameRef} />
        <CFormLabel>Permissions</CFormLabel>
        <CippAppPermissionBuilder
          colSize={12}
          currentPermissions={selectedTemplate}
          onSubmit={onSubmit}
          isSubmitting={false}
          removePermissionConfirm={false}
          appDisplayName={templateNameRef.current?.value}
        />
      </CippOffcanvas>
    </>
  )
}

export default AppApprovalTemplates
