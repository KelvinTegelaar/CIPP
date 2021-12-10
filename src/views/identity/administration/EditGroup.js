import React, { useEffect, useState } from 'react'
import {
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
import useQuery from '../../../hooks/useQuery'
import { setModalContent, showModal } from '../../../store/modules/modal'
import { listSharepointSites } from '../../../store/modules/sharepoint'
import { useDispatch, useSelector } from 'react-redux'
import { Form } from 'react-final-form'
import { RFFCFormInput } from '../../../components/RFFComponents'

const EditGroup = () => {
  const dispatch = useDispatch()
  let query = useQuery()
  const groupId = query.get('groupId')
  const tenantDomain = query.get('tenantDomain')

  const [queryError, setQueryError] = useState(false)

  const sharepoint = useSelector((state) => state.sharepoint)

  const {
    sites: {
      list: sharepointSiteList = [],
      loading: sharepointSiteListLoading,
      loaded: sharepointSiteListLoaded,
      error: sharepointSiteListError,
    },
  } = sharepoint

  useEffect(() => {
    async function load() {
      dispatch(listSharepointSites({ tenantDomain, groupId }))
    }

    if (!groupId || !tenantDomain) {
      dispatch(
        setModalContent({
          body: 'Error: Invalid request. Could not load requested group.',
          title: 'Invalid Request',
        }),
      )
      dispatch(showModal())
      setQueryError(true)
    } else {
      load()
    }
  }, [groupId, tenantDomain, dispatch])

  const onSubmit = (values) => {
    window.alert(JSON.stringify(values))
  }
  const initialState = {
    ...sharepoint,
  }

  return (
    <CCard className="bg-white rounded p-5">
      {!queryError && (
        <>
          <CRow>
            <CCol md={6}>
              <CCard>
                <CCardHeader>
                  <CCardTitle>Group Details</CCardTitle>
                </CCardHeader>
                <CCardBody>
                  {!sharepointSiteListLoaded && sharepointSiteListLoading && <CSpinner />}
                  {!sharepointSiteListLoaded &&
                    !sharepointSiteListLoading &&
                    sharepointSiteListError && <span>Error loading Sharepoint groups</span>}
                  {sharepointSiteListLoaded && !sharepointSiteListLoading && (
                    <Form
                      initialValues={{ ...initialState }}
                      onSubmit={onSubmit}
                      render={({ handleSubmit, submitting, values }) => {
                        return (
                          <CForm onSubmit={handleSubmit}>
                            <CRow>
                              <CCol md={6}>
                                <RFFCFormInput type="text" name="AddMembers" label="Add Member" />
                              </CCol>
                            </CRow>
                            <CRow>
                              <CCol md={6}>
                                <RFFCFormInput
                                  type="text"
                                  name="RemoveMembers"
                                  label="Remove Member"
                                />
                              </CCol>
                            </CRow>
                            <CRow>
                              <CCol md={6}>
                                <RFFCFormInput type="text" name="AddOwners" label="Add Owner" />
                              </CCol>
                            </CRow>
                            <CRow>
                              <CCol md={6}>
                                <RFFCFormInput
                                  type="text"
                                  name="RemoveOwners"
                                  label="Remove Owner"
                                />
                              </CCol>
                            </CRow>
                            <CRow className="mb-3">
                              <CCol md={6}>
                                <CButton type="submit" disabled={submitting}>
                                  Edit Group
                                </CButton>
                              </CCol>
                            </CRow>
                            {/*<CRow>*/}
                            {/* <CCol>*/}
                            {/*   <pre>{JSON.stringify(values, null, 2)}</pre>*/}
                            {/* </CCol>*/}
                            {/*</CRow>*/}
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
                  <CCardTitle>Group Inforamtion</CCardTitle>
                </CCardHeader>
                <CCardBody>
                  {!sharepointSiteListLoaded && sharepointSiteListLoading && <CSpinner />}
                  {sharepointSiteListLoaded && !sharepointSiteListLoading && (
                    <>
                      This is the (raw) information for this group.
                      <pre>{JSON.stringify(sharepointSiteList, null, 2)}</pre>
                    </>
                  )}
                </CCardBody>
              </CCard>
            </CCol>
          </CRow>
        </>
      )}
    </CCard>
  )
}

export default EditGroup
