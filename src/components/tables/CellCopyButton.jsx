import PropTypes from 'prop-types'
import CippCopyToClipboard from '../utilities/CippCopyToClipboard'

export function CellCopyButton({ cell }) {
  console.log('hi! cell:', cell)
  return <CippCopyToClipboard text={cell} />
}

CellCopyButton.propTypes = {
  propName: PropTypes.string,
  cell: PropTypes.object,
}

export const cellCopyButtonFormatter = () => (row, index, column, id) => {
  const cell = column.selector(row)
  console.log('cell:', cell)
  return CellCopyButton({ cell })
}
