import PropTypes from 'prop-types'
import cellGetProperty from './cellGetProperty'

export function CellNullText({ cell }) {
  return cell ?? 'n/a'
}

CellNullText.propTypes = {
  cell: PropTypes.string,
}

export const cellNullTextFormatter = () => (row, index, column, id) => {
  const cell = cellGetProperty(row, index, column, id)
  return CellNullText({ cell })
}
