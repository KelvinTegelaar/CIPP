import React from 'react'
import { CButton } from '@coreui/react'
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import PropTypes from 'prop-types'

function ExportPDFButton(props) {
  const exportPDF = (pdfData, pdfHeaders, pdfSize = 'A4', reportName) => {
    const unit = 'pt'
    const size = pdfSize // Use A1, A2, A3 or A4
    const orientation = 'landscape' // portrait or landscape

    const marginLeft = 40
    const doc = new jsPDF(orientation, unit, size)

    doc.setFontSize(10)
    let headerObj = []
    pdfHeaders.forEach((item) => {
      if (item.exportselector) {
        let returnobj = { header: item.name, dataKey: item.exportselector }
        headerObj.push(returnobj)
      }
    })

    console.log(headerObj)
    const title = reportName
    let content = {
      startY: 50,
      columns: headerObj,
      body: pdfData,
      theme: 'grid',
      headStyles: { fillColor: [247, 127, 0] },
    }

    doc.text(title, marginLeft, 40)
    doc.autoTable(content)
    doc.save(reportName + '.pdf')
  }

  return (
    <CButton
      size="sm"
      className="text-white m-1"
      onClick={() => exportPDF(props.pdfData, props.pdfHeaders, props.pdfSize, props.reportName)}
    >
      PDF
    </CButton>
  )
}
export default ExportPDFButton

ExportPDFButton.propTypes = {
  pdfData: PropTypes.oneOfType([PropTypes.element, PropTypes.string, PropTypes.array]),
  pdfHeaders: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  pdfSize: PropTypes.oneOf(['A1', 'A2', 'A3', 'A4']),
  reportName: PropTypes.oneOfType([PropTypes.element, PropTypes.string, PropTypes.number]),
}
