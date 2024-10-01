import React from 'react'
import { CButton } from '@coreui/react'
import { CSVDownloader } from 'react-papaparse'
import PropTypes from 'prop-types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFileCsv } from '@fortawesome/free-solid-svg-icons'

function ExportCsvButton(props) {
  return (
    <CSVDownloader data={props.csvData} filename={`${props.reportName}`}>
      <FontAwesomeIcon className="me-2" icon={faFileCsv}></FontAwesomeIcon>
      {props.nameText}
    </CSVDownloader>
  )
}
export default ExportCsvButton

ExportCsvButton.propTypes = {
  csvData: PropTypes.array.isRequired,
  nameText: PropTypes.string,
  reportName: PropTypes.oneOfType([PropTypes.element, PropTypes.string, PropTypes.number]),
}
