import React from 'react'
import { useListDatatableQuery } from 'src/store/api/datatable'
import PropTypes from 'prop-types'
import { CListGroup, CListGroupItem } from '@coreui/react'

export default function CippDatatable({ path, params, ...rest }) {}

CippDatatable.propTypes = {
  path: PropTypes.string.isRequired,
  params: PropTypes.object,
  ...CippTablePropTypes,
}
