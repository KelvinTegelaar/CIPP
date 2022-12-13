import React, { useEffect, useState } from 'react'
import {
  CCallout,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCardTitle,
  CCol,
  CForm,
  CRow,
  CSpinner,
} from '@coreui/react'
import useQuery from 'src/hooks/useQuery'
import { ModalService } from 'src/components/utilities'
import { useDispatch } from 'react-redux'
import { Form } from 'react-final-form'
import { RFFCFormInput, RFFCFormRadio } from 'src/components/forms'
import { useLazyGenericPostRequestQuery } from 'src/store/api/app'
import { useListDevicePoliciesQuery } from 'src/store/api/devices'

const MEMEditPolicy = () => {
  const dispatch = useDispatch()
  let query = useQuery()
  const policyID = query.get('ID')
  const tenantDomain = query.get('tenantDomain')
  const urlName = query.get('urlName')

  const [queryError, setQueryError] = useState(false)

  const {
    data: group = {},
    isFetching,
    error,
    isSuccess,
  } = useListDevicePoliciesQuery({ tenantDomain, PolicyID: policyID, urlName: urlName })

  useEffect(() => {
    if (!policyID || !tenantDomain) {
      ModalService.open({
        body: 'Error: Invalid request. Could not load requested policy.',
        title: 'Invalid Request',
      })
      setQueryError(true)
    }
  }, [policyID, tenantDomain, dispatch])
  const [genericPostRequest, postResults] = useLazyGenericPostRequestQuery()
  const onSubmit = (values) => {
    const shippedValues = {
      tenantID: tenantDomain,
      GroupID: policyID,
      displayName: values.displayName,
      Description: values.description,
      AssignTo: values.AssignTo,
    }
    //window.alert(JSON.stringify(shippedValues))
    genericPostRequest({ path: '/api/EditPolicy', values: shippedValues })
  }

  const initialState = {
    AssignTo: 'on',
    ...group[0],
  }
  return (
    <>
      {!queryError && (
        <>
          <CRow>
            <CCol md={6}>
              <CCard>
                <CCardHeader>
                  <CCardTitle>Policy Details</CCardTitle>
                </CCardHeader>
                <CCardBody>
                  {isFetching && <CSpinner />}
                  {error && <span>Error loading Group</span>}
                  {isSuccess && (
                    <Form
                      initialValues={{ ...initialState }}
                      onSubmit={onSubmit}
                      render={({ handleSubmit, submitting, values }) => {
                        return (
                          <CForm onSubmit={handleSubmit}>
                            <CRow>
                              <CCol>
                                <RFFCFormInput
                                  type="text"
                                  name="displayName"
                                  label="Display Name"
                                  placeholder="Enter the Display Name"
                                />
                              </CCol>
                            </CRow>
                            <CRow>
                              <CCol>
                                <RFFCFormInput
                                  type="text"
                                  name="description"
                                  label="Description"
                                  placeholder="Enter the description"
                                />
                              </CCol>
                            </CRow>
                            <CRow>
                              <CCol>
                                <RFFCFormRadio
                                  value="on"
                                  name="AssignTo"
                                  label="Do not assign"
                                ></RFFCFormRadio>
                                <RFFCFormRadio
                                  value="allLicensedUsers"
                                  name="AssignTo"
                                  label="Assign to all users"
                                ></RFFCFormRadio>
                                <RFFCFormRadio
                                  value="AllDevices"
                                  name="AssignTo"
                                  label="Assign to all devices"
                                ></RFFCFormRadio>
                                <RFFCFormRadio
                                  value="AllDevicesAndUsers"
                                  name="AssignTo"
                                  label="Assign to all users and devices"
                                ></RFFCFormRadio>
                              </CCol>
                            </CRow>

                            <CRow className="mb-3">
                              <CCol md={6}>
                                <CButton type="submit" disabled={submitting}>
                                  Edit Policy
                                </CButton>
                              </CCol>
                            </CRow>
                            {postResults.isSuccess && (
                              <CCallout color="success">{postResults.data.Results}</CCallout>
                            )}
                          </CForm>
                        )
                      }}
                    />
                  )}
                </CCardBody>
              </CCard>
            </CCol>
            <CCol md={6}>
              <CCard>
                <CCardHeader>
                  <CCardTitle>Policy Information</CCardTitle>
                </CCardHeader>
                <CCardBody>
                  {isFetching && <CSpinner />}
                  {isSuccess && (
                    <>
                      This is the (raw) information for this policy
                      <pre>{JSON.stringify(group, null, 2)}</pre>
                    </>
                  )}
                </CCardBody>
              </CCard>
            </CCol>
          </CRow>
        </>
      )}
    </>
  )
}

export default MEMEditPolicy
