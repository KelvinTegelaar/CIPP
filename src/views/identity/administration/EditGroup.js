import React, { useEffect, useState } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCardTitle,
  CCol,
  CForm,
  CListGroup,
  CListGroupItem,
  CRow,
  CSpinner,
} from '@coreui/react'
import useQuery from '../../../hooks/useQuery'
import { setModalContent } from '../../../store/features/modal'
import {
  useListGroupMembersQuery,
  useListGroupOwnersQuery,
  useListGroupQuery,
} from '../../../store/api/groups'
import { useDispatch } from 'react-redux'
import { Form } from 'react-final-form'
import { RFFCFormInput } from '../../../components/RFFComponents'
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
    membersisFetching,
    membersError,
    membersIsSuccess,
  } = useListGroupMembersQuery({ tenantDomain, groupId })

  const {
    data: owners = {},
    ownersisFetching,
    ownersError,
    ownersIsSuccess,
  } = useListGroupOwnersQuery({ tenantDomain, groupId })

  useEffect(() => {
    if (!groupId || !tenantDomain) {
      dispatch(
        setModalContent({
          body: 'Error: Invalid request. Could not load requested group.',
          title: 'Invalid Request',
          visible: true,
        }),
      )
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
    genericPostRequest({ url: 'api/EditGroup', values: shippedValues })
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
                  <CCardTitle>Group members</CCardTitle>
                </CCardHeader>
                <CCardBody>
                  {membersisFetching && <CSpinner />}
                  {membersError && <span>Error loading members</span>}
                  {ownersError && <span>Error loading Group owners</span>}

                  {membersIsSuccess && (
                    <>
                      These are the current members;
                      <CListGroup flush>
                        {owners.map(({ owner }) => (
                          <CListGroupItem
                            key={owner}
                            className="d-flex justify-content-between align-items-center"
                          >
                            {owners.displayName} - Owner
                          </CListGroupItem>
                        ))}
                        {members.map(({ member }) => (
                          <CListGroupItem
                            key={member}
                            className="d-flex justify-content-between align-items-center"
                          >
                            {member.displayName} - Member
                          </CListGroupItem>
                        ))}
                      </CListGroup>
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
    </CCard>
  )
}

export default EditGroup
