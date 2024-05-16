import React from 'react'
import { CippOffcanvas } from 'src/components/utilities'
import PropTypes from 'prop-types'
import { CippDatatable, CippTable } from '../tables'
import { cellGenericFormatter } from '../tables/CellGenericFormat'

function CippTableOffcanvas({
  state: visible,
  hideFunction,
  title = 'Table',
  path,
  params,
  columns,
  tableProps,
  data = null,
}) {
  if (Array.isArray(data) && data !== null && data !== undefined && data?.length > 0) {
    if (!Array.isArray(data) && typeof data === 'object') {
      data = Object.keys(data).map((key) => {
        return {
          Key: key,
          Value: data[key],
        }
      })
    } else {
      if (Array.isArray(data) && typeof data[0] !== 'object') {
        data = data.map((row) => {
          return {
            Value: row,
          }
        })
      }
    }
    columns = []
    Object.keys(data[0]).map((key) => {
      columns.push({
        name: key,
        selector: (row) => row[key],
        sortable: true,
        exportSelector: key,
        cell: cellGenericFormatter(),
      })
    })
  }

  return (
    <>
      <CippOffcanvas
        title={title}
        addedClass="offcanvas-large"
        placement="end"
        visible={visible}
        hideFunction={hideFunction}
      >
        <>
          {Array.isArray(data) && data !== null && data !== undefined ? (
            <CippTable data={data} columns={columns} />
          ) : (
            <CippDatatable path={path} params={params} columns={columns} tableProps={tableProps} />
          )}
        </>
      </CippOffcanvas>
    </>
  )
}

CippTableOffcanvas.propTypes = {
  state: PropTypes.bool,
  hideFunction: PropTypes.func,
  title: PropTypes.string,
  path: PropTypes.string,
  params: PropTypes.object,
  columns: PropTypes.object,
  tableProps: PropTypes.object,
  data: PropTypes.object,
}

export default CippTableOffcanvas
