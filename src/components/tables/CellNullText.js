import PropTypes from 'prop-types'

export function CellNullText({ cell }) {
  return cell ?? 'n/a'
}

CellNullText.propTypes = {
  cell: PropTypes.string,
}

export const cellNullTextFormatter = () => (row, index, column, id) => {
  const cell = column.selector(row)
  return CellNullText({ cell })
}
