import PropTypes from 'prop-types'
import CippCopyToClipboard from '../utilities/CippCopyToClipboard'

export function CellCopyButton({ cell }) {
  return <CippCopyToClipboard text={cell} />
}

CellCopyButton.propTypes = {
  propName: PropTypes.string,
  cell: PropTypes.object,
}

export const cellCopyButtonFormatter = () => (row, index, column, id) => {
  const cell = column.selector(row)
  return CellCopyButton({ cell })
}
