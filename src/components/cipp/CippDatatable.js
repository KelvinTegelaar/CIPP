import React from 'react'
import ExportPDFButton from 'src/components/cipp/PdfButton'
import { CButton, CSpinner } from '@coreui/react'
import DataTable, { TableProps } from 'react-data-table-component'
import { useListDatatableQuery } from '../../store/api/datatable'
import PropTypes from 'prop-types'
import styled from 'styled-components'

export default function CippDatatable({
  path,
  params,
  reportName,
  columns = [],
  tableProps: {
    pagination = true,
    responsive = true,
    dense = true,
    striped = true,
    subheader = true,
    ...rest
  } = {},
}) {
  const { data = [], isFetching, error } = useListDatatableQuery({ path, params })
  const actionsMemo = React.useMemo(
    () => (
      <ExportPDFButton pdfdata={data} pdfheaders={columns} pdfsize="A4" reportname={reportName} />
    ),
    [columns, data, reportName],
  )
  const TextField = styled.input`
    height: 32px;
    width: 200px;
    border-radius: 3px;
    border-top-left-radius: 5px;
    border-bottom-left-radius: 5px;
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
    border: 1px solid #e5e5e5;
    padding: 0 32px 0 16px;

    &:hover {
      cursor: pointer;
    }
  `
  {
    /* eslint-disable */
  }
  const FilterComponent = ({ filterText, onFilter, onClear }) => (
    <>
      <TextField
        id="search"
        type="text"
        placeholder="Filter"
        aria-label="Search Input"
        value={filterText}
        onChange={onFilter}
      />
      <CButton type="button" size="sm" onClick={onClear}>
        X
      </CButton>
    </>
  )

  const [filterText, setFilterText] = React.useState('')
  const [resetPaginationToggle, setResetPaginationToggle] = React.useState(false)
  const filteredItems = data.filter(
    (item) => JSON.stringify(item).toLowerCase().indexOf(filterText.toLowerCase()) !== -1,
  )

  const subHeaderComponentMemo = React.useMemo(() => {
    const handleClear = () => {
      if (filterText) {
        setResetPaginationToggle(!resetPaginationToggle)
        setFilterText('')
      }
    }
    {
      /* eslint-disable */
    }
    return (
      <FilterComponent
        onFilter={(e) => setFilterText(e.target.value)}
        onClear={handleClear}
        filterText={filterText}
      />
    )
  }, [filterText, resetPaginationToggle])
  return (
    <div>
      {isFetching && <CSpinner />}
      {!isFetching && error && <span>Error loading data</span>}
      {!isFetching && !error && (
        <div>
          <hr />
          {/* eslint-disable */}
          <DataTable
            subHeader={subheader}
            subHeaderComponent={subHeaderComponentMemo}
            paginationResetDefaultPage={resetPaginationToggle}
            actions={actionsMemo}
            pagination={pagination}
            responsive={responsive}
            dense={dense}
            striped={striped}
            columns={columns}
            data={filteredItems}
            {...rest}
          />
          {/* eslint-enable */}
        </div>
      )}
    </div>
  )
}

CippDatatable.propTypes = {
  path: PropTypes.string.isRequired,
  params: PropTypes.object,
  reportName: PropTypes.string.isRequired,
  columns: PropTypes.arrayOf(PropTypes.object).isRequired,
  tableProps: PropTypes.shape(TableProps),
}
