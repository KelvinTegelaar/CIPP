import PropTypes from 'prop-types'
import M365Licenses from 'src/data/M365Licenses'

export function CellLicense({ cell }) {
  let licenses = []
  cell?.map((licenseAssignment, idx) => {
    for (var x = 0; x < M365Licenses.length; x++) {
      if (licenseAssignment.skuId == M365Licenses[x].GUID) {
        licenses.push(M365Licenses[x].Product_Display_Name)
        break
      }
    }
  })
  return licenses.join(', ')
}

CellLicense.propTypes = {
  cell: PropTypes.object,
}

export const cellLicenseFormatter = () => (row, index, column, id) => {
  const cell = column.selector(row)
  return CellLicense({ cell })
}
