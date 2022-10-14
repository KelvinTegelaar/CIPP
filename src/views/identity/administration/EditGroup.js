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
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons'
import useQuery from 'src/hooks/useQuery'
import {
  useListGroupMembersQuery,
  useListGroupOwnersQuery,
  useListGroupQuery,
} from 'src/store/api/groups'
import { useDispatch } from 'react-redux'
import { ModalService } from 'src/components/utilities'
import { Form } from 'react-final-form'
import { RFFCFormCheck, RFFSelectSearch } from 'src/components/forms'
import { useLazyGenericPostRequestQuery } from 'src/store/api/app'
import { useListUsersQuery } from 'src/store/api/users'
import { CippTable } from 'src/components/tables'

const EditGroup = () => {
  const dispatch = useDispatch()
  let query = useQuery()
  const groupId = query.get('groupId')
  const tenantDomain = query.get('tenantDomain')

  const [queryError, setQueryError] = useState(false)

  const {
    data: group = {},
    isFetching,
    error,
    isSuccess,
  } = useListGroupQuery({ tenantDomain, groupId })

  const {
    data: members = {},
    isFetching: membersisFetching,
    error: membersError,
    isSuccess: membersIsSuccess,
  } = useListGroupMembersQuery({ tenantDomain, groupId })

  const {
    data: owners = {},
    isFetching: ownersisFetching,
    error: ownersError,
    isSuccess: ownersIsSuccess,
  } = useListGroupOwnersQuery({ tenantDomain, groupId })
  const {
    data: users = [],
    isFetching: usersIsFetching,
    error: usersError,
  } = useListUsersQuery({ tenantDomain })
  const [roleInfo, setroleInfo] = React.useState([])
  useEffect(() => {
    if (ownersIsSuccess && membersIsSuccess) {
      const ownerWithRole = owners.map((owner) => {
        return {
          displayName: owner.displayName,
          mail: owner.mail,
          role: 'owner',
        }
      })
      const memberwithRole = members.map((owner) => {
        return {
          displayName: owner.displayName,
          mail: owner.mail,
          role: 'member',
        }
      })
      setroleInfo(ownerWithRole.concat(memberwithRole))
    }
  }, [owners, members, ownersIsSuccess, membersIsSuccess])

  useEffect(() => {
    if (!groupId || !tenantDomain) {
      ModalService.open({
        body: 'Error: Invalid request. Could not load requested group.',
        title: 'Invalid Request',
      })
      setQueryError(true)
    }
  }, [groupId, tenantDomain, dispatch])
  const [genericPostRequest, postResults] = useLazyGenericPostRequestQuery()
  const onSubmit = (values) => {
    const shippedValues = {
      tenantID: tenantDomain,
      GroupID: groupId,
      groupType: group[0].calculatedGroupType,
      AddMember: values.AddMembers ? values.AddMembers : '',
      AddOwner: values.AddOwners ? values.AddOwners : '',
      RemoveMember: values.RemoveMembers ? values.RemoveMembers : '',
      RemoveOwner: values.RemoveOwners ? values.RemoveOwners : '',
      allowExternal: values.allowExternal,
    }
    //window.alert(JSON.stringify(shippedValues))
    genericPostRequest({ path: '/api/EditGroup', values: shippedValues })
  }
  const tableColumns = [
    {
      name: 'Display Name',
      selector: (row) => row['displayName'],
      sortable: true,
      exportSelector: 'displayName',
    },
    {
      name: 'Mail',
      selector: (row) => row['mail'],
      sortable: true,
      exportSelector: 'mail',
    },
    {
      name: 'Role',
      selector: (row) => row['role'],
      sortable: true,
      exportSelector: 'role',
    },
  ]
  return (
    <>
      {!queryError && (
        <>
          <CRow>
            <CCol md={6}>
              <CCard>
                <CCardHeader>
                  <CCardTitle>Group Details</CCardTitle>
                </CCardHeader>
                <CCardBody>
                  {isFetching && <CSpinner />}
                  {error && <span>Error loading Group</span>}
                  {isSuccess && (
                    <Form
                      onSubmit={onSubmit}
                      render={({ handleSubmit, submitting, values }) => {
                        return (
                          <CForm onSubmit={handleSubmit}>
                            <CRow>
                              <CCol md={12}>
                                <RFFSelectSearch
                                  multi={true}
                                  label="Add User"
                                  values={users?.map((user) => ({
                                    value: user.userPrincipalName,
                                    name: `${user.displayName} - ${user.userPrincipalName}`,
                                  }))}
                                  placeholder={!usersIsFetching ? 'Select user' : 'Loading...'}
                                  name="AddMembers"
                                />
                                {usersError && <span>Failed to load list of users</span>}
                              </CCol>
                            </CRow>
                            <CRow>
                              <CCol md={12}>
                                <RFFSelectSearch
                                  multi={true}
                                  label="Remove User"
                                  values={users?.map((user) => ({
                                    value: user.userPrincipalName,
                                    name: `${user.displayName} - ${user.userPrincipalName}`,
                                  }))}
                                  placeholder={!usersIsFetching ? 'Select user' : 'Loading...'}
                                  name="RemoveMembers"
                                />
                                {usersError && <span>Failed to load list of users</span>}
                              </CCol>
                            </CRow>
                            <CRow>
                              <CCol md={12}>
                                <RFFSelectSearch
                                  multi={true}
                                  label="Add Owner"
                                  values={users?.map((user) => ({
                                    value: user.userPrincipalName,
                                    name: `${user.displayName} - ${user.userPrincipalName}`,
                                  }))}
                                  placeholder={!usersIsFetching ? 'Select user' : 'Loading...'}
                                  name="AddOwners"
                                />
                                {usersError && <span>Failed to load list of users</span>}
                              </CCol>
                            </CRow>
                            <CRow className="mb-3">
                              <CCol md={12}>
                                <RFFSelectSearch
                                  multi={true}
                                  label="Remove Owner"
                                  values={users?.map((user) => ({
                                    value: user.userPrincipalName,
                                    name: `${user.displayName} - ${user.userPrincipalName}`,
                                  }))}
                                  placeholder={!usersIsFetching ? 'Select user' : 'Loading...'}
                                  name="RemoveOwners"
                                />
                                {usersError && <span>Failed to load list of users</span>}
                              </CCol>
                            </CRow>
                            {(group[0].calculatedGroupType === 'Microsoft 365' ||
                              group[0].calculatedGroupType === 'Distribution List') && (
                              <RFFCFormCheck
                                name="allowExternal"
                                label="Let people outside the organization email the group"
                              />
                            )}
                            <CRow className="mb-3">
                              <CCol md={12}>
                                <CButton type="submit" disabled={submitting}>
                                  Edit Group
                                  {postResults.isFetching && (
                                    <FontAwesomeIcon
                                      icon={faCircleNotch}
                                      spin
                                      className="ms-2"
                                      size="1x"
                                    />
                                  )}
                                </CButton>
                              </CCol>
                            </CRow>
                            {postResults.isSuccess && (
                              <CCallout color="success">
                                {postResults.data.Results.map((result, idx) => (
                                  <li key={idx}>{result}</li>
                                ))}
                              </CCallout>
                            )}
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
                  <CCardTitle>Group members</CCardTitle>
                </CCardHeader>
                <CCardBody>
                  {(membersisFetching || ownersisFetching) && <CSpinner />}
                  {membersError && <span>Error loading members</span>}
                  {ownersError && <span>Error loading owners</span>}
                  {membersIsSuccess && ownersIsSuccess && isSuccess && (
                    <>
                      <CippTable
                        reportName={`Group Membership - ${group[0].displayName}`}
                        data={roleInfo}
                        columns={tableColumns}
                      />
                    </>
                  )}
                </CCardBody>
              </CCard>
              <br></br>
              <CCard>
                <CCardHeader>
                  <CCardTitle>Group Information</CCardTitle>
                </CCardHeader>
                <CCardBody>
                  {isFetching && <CSpinner />}
                  {isSuccess && (
                    <>
                      This is the (raw) information for this group.
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

export default EditGroup
