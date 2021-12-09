import React, { useEffect } from 'react'
import { CButton } from '@coreui/react'
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import PropTypes from 'prop-types'

function ExportPDFButton(props) {
  const exportPDF = (pdfdata, pdfheaders, pdfsize = 'A4', reportname) => {
    const unit = 'pt'
    //console.log(pdfheaders)
    const size = pdfsize // Use A1, A2, A3 or A4
    const orientation = 'landscape' // portrait or landscape

    const marginLeft = 40
    const doc = new jsPDF(orientation, unit, size)

    doc.setFontSize(10)
    let headerObj = []
    pdfheaders.forEach((item) => {
      let returnobj = { header: item.text, dataKey: item.dataField }
      headerObj.push(returnobj)
    })

    console.log(headerObj)
    const title = reportname
    let content = {
      startY: 50,
      columns: headerObj,
      body: pdfdata,
      theme: 'grid',
      headStyles: { fillColor: [247, 127, 0] },
    }

    doc.text(title, marginLeft, 40)
    doc.autoTable(content)
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
