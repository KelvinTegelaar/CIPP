import PropTypes from 'prop-types'
import { CImage } from '@coreui/react'

export function CellLogo({ cell }) {
  if (cell?.logoUrl) {
    return <CImage src={cell.logoUrl} height={16} width={16} />
  } else {
    return ''
  }
}

CellLogo.propTypes = {
  propName: PropTypes.string,
  cell: PropTypes.object,
}

export const cellLogoFormatter = () => (row, index, column, id) => {
  const cell = column.selector(row)
  return CellLogo({ cell })
}
