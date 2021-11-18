import React from 'react'
import PropTypes from 'prop-types'
import BootstrapTable from 'react-bootstrap-table-next'
import paginationFactory from 'react-bootstrap-table2-paginator'

/**
 * Table with checkboxes
 * @param props
 * @returns {JSX.Element}
 * @constructor
 */
export default class WizardTableField extends React.Component {
  static propTypes = {
    keyField: PropTypes.string.isRequired,
    data: PropTypes.array.isRequired,
    columns: PropTypes.array.isRequired,
    fieldProps: PropTypes.object,
  }

  static defaultProps = {
    data: [],
    columns: [],
  }

  constructor(props) {
    super(props)
    // Bootstrap table's selected uses indexes to track checkboxes
    // match state from react-final-form
    const { fieldProps } = props

    let initiallySelected = props.data
      .map((el, idx) => {
        if (fieldProps.input.value.includes(el)) {
          return idx
        }
        return undefined
      })
      .filter((el) => el !== undefined)

    this.state = {
      selected: initiallySelected,
    }
  }

  handleOnSelect = (row, isSelect, rowIndex) => {
    const { keyField, fieldProps } = this.props
    if (isSelect) {
      fieldProps.input.onChange([...fieldProps.input.value, row])
      this.setState(() => ({
        selected: [...this.state.selected, rowIndex],
      }))
    } else {
      fieldProps.input.onChange(
        fieldProps.input.value.filter((el) => el[keyField] !== row[keyField]),
      )
      this.setState(() => ({
        selected: this.state.selected.filter((el) => el !== row[keyField]),
      }))
    }
  }

  handleOnSelectAll = (isSelect, rows) => {
    const { fieldProps } = this.props
    const ids = rows.map((el, idx) => idx)
    if (isSelect) {
      fieldProps.input.onChange(rows)
      this.setState(() => ({
        selected: ids,
      }))
    } else {
      fieldProps.input.onChange([])
      this.setState(() => ({
        selected: [],
      }))
    }
  }

  render() {
    const { keyField, columns, data } = this.props
    const pagination = paginationFactory()

    console.log('wizard table state', this.state)

    return (
      <BootstrapTable
        keyField={keyField}
        data={data}
        pagination={pagination}
        columns={columns}
        selectRow={{
          mode: 'checkbox',
          clickToSelect: true,
          selected: this.state.selected,
          onSelect: this.handleOnSelect,
          onSelectAll: this.handleOnSelectAll,
        }}
      />
    )
  }
}
