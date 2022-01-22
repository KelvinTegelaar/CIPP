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
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
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
import { RFFCFormInput } from 'src/components/forms'
import { useLazyGenericPostRequestQuery } from 'src/store/api/app'

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
  // console.log(members.isSuccess)
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
      AddMember: values.AddMembers,
      AddOwner: values.AddOwners,
      RemoveMember: values.RemoveMembers,
      RemoveOwner: values.RemoveOwners,
    }
    //window.alert(JSON.stringify(shippedValues))
    genericPostRequest({ path: '/api/EditGroup', values: shippedValues })
  }
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
                              <CCallout color="success">{postResults.data.Results}</CCallout>
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

                  {membersIsSuccess && ownersIsSuccess && (
                    <>
                      These are the current members;
                      <CTable>
                        <CTableHead>
                          <CTableRow>
                            <CTableHeaderCell scope="col">Name</CTableHeaderCell>
                            <CTableHeaderCell scope="col">Mail</CTableHeaderCell>
                            <CTableHeaderCell scope="col">Role</CTableHeaderCell>
                          </CTableRow>
                        </CTableHead>
                        <CTableBody>
                          {owners.map((owner) => (
                            <CTableRow key={owner.displayName}>
                              <CTableDataCell>{owner.displayName}</CTableDataCell>
                              <CTableDataCell>{owner.mail}</CTableDataCell>
                              <CTableDataCell>Owner</CTableDataCell>
                            </CTableRow>
                          ))}
                          {members.map((member) => (
                            <CTableRow key={member.displayName}>
                              <CTableDataCell>{member.displayName}</CTableDataCell>
                              <CTableDataCell>{member.mail}</CTableDataCell>
                              <CTableDataCell>Member</CTableDataCell>
                            </CTableRow>
                          ))}
                        </CTableBody>
                      </CTable>
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
