import React from 'react'
import { CButton } from '@coreui/react'
import { CSVDownloader } from 'react-papaparse'
import PropTypes from 'prop-types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFileCsv } from '@fortawesome/free-solid-svg-icons'

function ExportCsvButton(props) {
  return (
    <CSVDownloader data={props.csvData} filename={`${props.reportName}`}>
      <CButton size="sm" className="m-1">
        <FontAwesomeIcon icon={faFileCsv} className="pe-1" size="lg" />
        CSV
      </CButton>
    </CSVDownloader>
  )
}
export default ExportCsvButton

ExportCsvButton.propTypes = {
  csvData: PropTypes.array.isRequired,
  reportName: PropTypes.oneOfType([PropTypes.element, PropTypes.string, PropTypes.number]),
}
