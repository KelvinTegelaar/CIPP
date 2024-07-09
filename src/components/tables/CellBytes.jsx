import PropTypes from 'prop-types'

export function CellBytes({ cell }) {
  return (cell / 1024 ** 3).toFixed(2)
}

CellBytes.propTypes = {
  propName: PropTypes.string,
  cell: PropTypes.object,
}

export function CellBytesToPercentage({ row, value, dividedBy }) {
  return Math.round((row[value] / row[dividedBy]) * 100 * 10) / 10
}

CellBytesToPercentage.propTypes = {
  propName: PropTypes.string,
  cell: PropTypes.object,
}

export const cellBytesFormatter = () => (row, index, column, id) => {
  const cell = column.selector(row)
  return CellBytes({ cell })
}
