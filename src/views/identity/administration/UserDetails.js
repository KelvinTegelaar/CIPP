import React from 'react'
import PropTypes from 'prop-types'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCardTitle,
  CSpinner,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableRow,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilContact } from '@coreui/icons'
import { useListUserQuery } from '../../../store/api/users'

const columns = [
  {
    text: 'First Name',
    dataField: 'givenName',
  },
  {
    text: 'Last Name',
    dataField: 'surname',
  },
  {
    text: 'User Principal Name',
    dataField: 'userPrincipalName',
  },
  {
    text: 'Licenses',
    dataField: 'LicJoined',
  },
  {
    text: 'Alias',
    dataField: 'mailNickname',
  },
  {
    text: 'Primary Domain',
    dataField: 'primDomain',
  },
  {
    text: 'Usage Location',
    dataField: 'usageLocation',
  },
  {
    text: 'Street Address',
    dataField: 'streetAddress',
  },
  {
    text: 'City',
    dataField: 'city',
  },
  {
    text: 'Postcode',
    dataField: 'postalCode',
  },
  {
    text: 'Country',
    dataField: 'country',
  },
  {
    text: 'Company Name',
    dataField: 'companyName',
  },
  {
    text: 'Department',
    dataField: 'department',
  },
  {
    text: 'Mobile Phone',
    dataField: 'mobilePhone',
  },
  {
    text: 'Business Phone',
    dataField: 'businessPhones',
  },
]

export default function UserDetails({ tenantDomain, userId }) {
  const { data: user = {}, isFetching, error } = useListUserQuery({ tenantDomain, userId })

  return (
    <CCard>
      <CCardHeader className="d-flex justify-content-between">
        <CCardTitle>{user.displayName}</CCardTitle>
        <CIcon icon={cilContact} />
      </CCardHeader>
      <CCardBody className="card-body">
        {!isFetching && error && <span>Error loading user details</span>}
        {!error && isFetching && <CSpinner />}
        {!isFetching && !error && (
          <CTable className="table">
            <CTableBody>
              {columns.map((column, index) => (
                <CTableRow key={index}>
                  <CTableDataCell>{column.text}</CTableDataCell>
                  <CTableDataCell>{user[column.dataField]}</CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>
        )}
      </CCardBody>
    </CCard>
  )
}

UserDetails.propTypes = {
  tenantDomain: PropTypes.string.isRequired,
  userId: PropTypes.string.isRequired,
}
