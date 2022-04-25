import React, { useEffect, useState } from 'react'
import {
  CButton,
  CCallout,
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
import { useDispatch } from 'react-redux'
import { Form } from 'react-final-form'
import { RFFSelectSearch } from 'src/components/forms'
import { ModalService } from 'src/components/utilities'
import { useLazyGenericGetRequestQuery } from 'src/store/api/app'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons'
import { useListCalendarPermissionsQuery, useListMailboxesQuery } from 'src/store/api/mailbox'

const EditCalendarPermission = () => {
  const dispatch = useDispatch()
  let query = useQuery()
  const userId = query.get('userId')
  const tenantDomain = query.get('tenantDomain')

  const [queryError, setQueryError] = useState(false)

  const {
    data: user = {},
    isFetching: userIsFetching,
    error: userError,
  } = useListCalendarPermissionsQuery({ tenantDomain, userId })

  const {
    data: users = [],
    isFetching: usersIsFetching,
    error: usersError,
  } = useListMailboxesQuery({ tenantDomain })

  useEffect(() => {
    if (!userId || !tenantDomain) {
      ModalService.open({
        body: 'Error invalid request, could not load requested user.',
        title: 'Invalid Request',
      })
      setQueryError(true)
    } else {
      setQueryError(false)
    }
  }, [userId, tenantDomain, dispatch])
  const [genericPostRequest, postResults] = useLazyGenericGetRequestQuery()
  const onSubmit = (values) => {
    if (values.RemoveAccess) {
      values.RemoveAccess = values.RemoveAccess.value
    }
    if (!values.RemoveAccess) {
      values.RemoveAccess = ''
    }
    if (values.UserToGetPermissions) {
      values.UserToGetPermissions = values.UserToGetPermissions.value
      values.Permissions = values.Permissions.value
    }
    const shippedValues = {
      FolderName: user[0].FolderName,
      userid: userId,
      tenantFilter: tenantDomain,
      ...values,
    }
    //window.alert(JSON.stringify(shippedValues))
    genericPostRequest({ path: '/api/ExecEditCalendarPermissions', params: shippedValues })
  }
  const initialState = {}

  // this is dumb
  const formDisabled = queryError === true

  const UsersMapped = users?.map((user) => ({
    value: `${user.primarySmtpAddress}`,
    name: `${user.displayName} - (${user.primarySmtpAddress})`,
  }))
  UsersMapped.unshift({ value: 'Default', name: 'Default' })

  return (
    <CCard className="page-card">
      {!queryError && (
        <>
          {postResults.isSuccess && (
            <CCallout color="success">{postResults.data?.Results}</CCallout>
          )}
          {queryError && (
            <CRow>
              <CCol md={12}>
                <CCallout color="danger">
                  {/* @todo add more descriptive help message here */}
                  Failed to load user
                </CCallout>
              </CCol>
            </CRow>
          )}
          <CRow>
            <CCol md={6}>
              <CCard>
                <CCardHeader>
                  <CCardTitle>Account Details</CCardTitle>
                </CCardHeader>
                <CCardBody>
                  {userIsFetching && <CSpinner />}
                  {userError && <span>Error loading user</span>}
                  {!userIsFetching && (
                    <Form
                      initialValues={{ ...initialState }}
                      onSubmit={onSubmit}
                      render={({ handleSubmit, submitting, values }) => {
                        return (
                          <CForm onSubmit={handleSubmit}>
                            <CRow className="mb-3">
                              <CCol md={12}>
                                <RFFSelectSearch
                                  label="Remove Access"
                                  disabled={formDisabled}
                                  values={UsersMapped}
                                  placeholder={!usersIsFetching ? 'Select user' : 'Loading...'}
                                  name="RemoveAccess"
                                />
                                {usersError && <span>Failed to load list of users</span>}
                              </CCol>
                              <CCol md={12}>
                                <RFFSelectSearch
                                  label="Add Access"
                                  disabled={formDisabled}
                                  values={UsersMapped}
                                  placeholder={!usersIsFetching ? 'Select user' : 'Loading...'}
                                  name="UserToGetPermissions"
                                />
                                {usersError && <span>Failed to load list of users</span>}
                              </CCol>
                              <CCol md={12}>
                                <RFFSelectSearch
                                  label="Permission Level"
                                  disabled={formDisabled}
                                  values={[
                                    { value: 'Author', name: 'Author' },
                                    { value: 'Contributor', name: 'Contributor' },
                                    { value: 'Editor', name: 'Editor' },
                                    { value: 'Owner', name: 'Owner' },
                                    { value: 'NonEditingAuthor', name: 'Non Editing Author' },
                                    { value: 'PublishingAuthor', name: 'Publishing Author' },
                                    { value: 'PublishingEditor', name: 'Publishing Editor' },
                                    { value: 'Reviewer', name: 'Reviewer' },
                                  ]}
                                  placeholder="Select a permission level"
                                  name="Permissions"
                                />
                                {usersError && <span>Failed to load list of users</span>}
                              </CCol>
                            </CRow>
                            <CRow className="mb-3">
                              <CCol md={6}>
                                <CButton type="submit" disabled={submitting || formDisabled}>
                                  Edit Permissions
                                  {postResults.isFetching && (
                                    <FontAwesomeIcon
                                      icon={faCircleNotch}
                                      spin
                                      className="me-2"
                                      size="1x"
                                    />
                                  )}
                                </CButton>
                              </CCol>
                            </CRow>
                            {postResults.isSuccess && (
                              <CCallout color="success">{postResults.data?.Results}</CCallout>
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
                  <CCardTitle>Account Information</CCardTitle>
                </CCardHeader>
                <CCardBody>
                  {userIsFetching && <CSpinner />}
                  {!userIsFetching && (
                    <>
                      These are the current set permissions for this account:
                      <pre>{JSON.stringify(user, null, 2)}</pre>
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

export default EditCalendarPermission
