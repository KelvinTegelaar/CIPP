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
  CAlert,
} from '@coreui/react'
import useQuery from 'src/hooks/useQuery'
import { useDispatch } from 'react-redux'
import { Form } from 'react-final-form'
import { RFFSelectSearch } from 'src/components/forms'
import { useListUsersQuery } from 'src/store/api/users'
import { ModalService } from 'src/components/utilities'
import { useLazyGenericPostRequestQuery } from 'src/store/api/app'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons'
import { useListMailboxPermissionsQuery } from 'src/store/api/mailbox'

const EditMailboxPermission = () => {
  const dispatch = useDispatch()
  let query = useQuery()
  const userId = query.get('userId')
  const tenantDomain = query.get('tenantDomain')

  const [queryError, setQueryError] = useState(false)

  //const [EditMailboxPermission, { error: EditMailboxPermissionError, isFetching: EditMailboxPermissionIsFetching }] = useEditMailboxPermissionMutation()

  const {
    data: user = {},
    isFetching: userIsFetching,
    error: userError,
  } = useListMailboxPermissionsQuery({ tenantDomain, userId })

  const {
    data: users = [],
    isFetching: usersIsFetching,
    error: usersError,
  } = useListUsersQuery({ tenantDomain })

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
  const [genericPostRequest, postResults] = useLazyGenericPostRequestQuery()
  const onSubmit = (values) => {
    if (!values.AddFullAccess) {
      values.AddFullAccess = ''
    }
    if (!values.RemoveFullAccess) {
      values.RemoveFullAccess = ''
    }
    if (!values.AddFullAccessNoAutoMap) {
      values.AddFullAccessNoAutoMap = ''
    }
    const shippedValues = {
      userid: userId,
      tenantFilter: tenantDomain,
      ...values,
    }
    //window.alert(JSON.stringify(shippedValues))
    genericPostRequest({ path: '/api/ExecEditMailboxPermissions', values: shippedValues })
  }
  const initialState = {
    ...user,
  }

  // this is dumb
  const formDisabled = queryError === true

  return (
    <CCard className="page-card">
      {!queryError && (
        <>
          {postResults.isSuccess && <CAlert color="success">{postResults.data?.Results}</CAlert>}
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
                                  label="Remove Full Access"
                                  disabled={formDisabled}
                                  values={users?.map((user) => ({
                                    value: user.mail,
                                    name: user.displayName,
                                  }))}
                                  placeholder={!usersIsFetching ? 'Select user' : 'Loading...'}
                                  name="RemoveFullAccess"
                                />
                                {usersError && <span>Failed to load list of users</span>}
                              </CCol>
                              <CCol md={12}>
                                <RFFSelectSearch
                                  label="Add Full Access - Automapping Enabled"
                                  disabled={formDisabled}
                                  values={users?.map((user) => ({
                                    value: user.mail,
                                    name: user.displayName,
                                  }))}
                                  placeholder={!usersIsFetching ? 'Select user' : 'Loading...'}
                                  name="AddFullAccess"
                                />
                                {usersError && <span>Failed to load list of users</span>}
                              </CCol>
                              <CCol md={12}>
                                <RFFSelectSearch
                                  label="Add Full Access - Automapping Disabled"
                                  disabled={formDisabled}
                                  values={users?.map((user) => ({
                                    value: user.mail,
                                    name: user.displayName,
                                  }))}
                                  placeholder={!usersIsFetching ? 'Select user' : 'Loading...'}
                                  name="AddFullAccessNoAutoMap"
                                />
                                {usersError && <span>Failed to load list of users</span>}
                              </CCol>
                            </CRow>
                            <CRow className="mb-3">
                              <CCol md={6}>
                                <CButton type="submit" disabled={submitting || formDisabled}>
                                  Edit User Permissions
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
                              <CAlert color="success">{postResults.data?.Results}</CAlert>
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

export default EditMailboxPermission
