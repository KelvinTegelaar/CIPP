import React from 'react'
import { CippOffcanvas } from 'src/components/utilities'
import PropTypes from 'prop-types'
import { CippDatatable } from '../tables'

function CippTableOffcanvas({
  state: visible,
  hideFunction,
  title = 'Table',
  path,
  params,
  columns,
  tableProps,
}) {
  return (
    <>
      <CippOffcanvas
        title={title}
        addedClass="offcanvas-large"
        placement="end"
        visible={visible}
        hideFunction={hideFunction}
      >
        <CippDatatable path={path} params={params} columns={columns} tableProps={tableProps} />
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
}

export default CippTableOffcanvas
