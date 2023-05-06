import PropTypes from 'prop-types'
import { useGenericGetRequestQuery } from 'src/store/api/app'

export function CellLicense({ cell }) {
  const { data: licenseMap, isSuccess: isLicenseMapSuccess } = useGenericGetRequestQuery({
    path: '/M365Licenses.json',
  })

  let licenses = []
  cell?.map((licenseAssignment, idx) => {
    if (isLicenseMapSuccess) {
      for (var x = 0; x < licenseMap.length; x++) {
        if (licenseAssignment.skuId == licenseMap[x].GUID) {
          /*console.log(license.Product_Display_Name)*/
          licenses.push(licenseMap[x].Product_Display_Name)
          break
        }
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
