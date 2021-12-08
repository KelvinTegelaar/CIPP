import React, { useEffect } from 'react'
import { CButton } from '@coreui/react'
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import PropTypes from 'prop-types'

function ExportPDFButton(props) {
  const exportPDF = (pdfdata, pdfheaders, pdfsize = 'A4', reportname) => {
    const unit = 'pt'
    console.log(pdfdata)
    const size = pdfsize // Use A1, A2, A3 or A4
    const orientation = 'landscape' // portrait or landscape

    const marginLeft = 40
    const doc = new jsPDF(orientation, unit, size)
    const pdfdatafinal = pdfdata.map((pdfdata) => pdfheaders)

    doc.setFontSize(10)

    const title = reportname
    let content = {
      head: [pdfheaders],
      body: pdfdata,
      theme: 'grid',
    }

    doc.text(title, marginLeft, 40)
    doc.autoTable(pdfheaders, pdfdata)
    doc.save(reportname + '.pdf')
  }

  return (
    <CButton
      onClick={() => exportPDF(props.pdfdata, props.pdfheaders, props.pdfsize, props.reportname)}
    >
      PDF
    </CButton>
  )
}
export default ExportPDFButton

ExportPDFButton.propTypes = {
  pdfdata: PropTypes.oneOfType([PropTypes.element, PropTypes.string, PropTypes.array]),
  pdfheaders: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  pdfsize: PropTypes.oneOf(['A1', 'A2', 'A3', 'A4']),
  reportname: PropTypes.oneOfType([PropTypes.element, PropTypes.string, PropTypes.number]),
}
