import React from 'react'
import PropTypes from 'prop-types'
import BootstrapTable from 'react-bootstrap-table-next'
import paginationFactory from 'react-bootstrap-table2-paginator'
const pagination = paginationFactory()

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

    // Bootstrap table's selected uses keyField to track checkboxes
    // match state from react-final-form on rerender
    const { fieldProps, keyField } = props

    const previouslySelected = props.data
      .map((el) => {
        if (fieldProps.input.value.includes(el)) {
          return el[keyField]
        }
        return undefined
      })
      .filter((el) => el !== undefined)

    this.state = {
      selected: previouslySelected,
    }
  }

  handleOnSelect = (row, isSelect) => {
    const { fieldProps, keyField } = this.props

    if (isSelect) {
      fieldProps.input.onChange([...fieldProps.input.value, row])
      this.setState(() => ({
        selected: [...this.state.selected, row[keyField]],
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
    const { fieldProps, keyField } = this.props
    if (isSelect) {
      fieldProps.input.onChange(rows)
      this.setState(() => ({
        selected: rows.map((el) => el[keyField]),
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

    return (
      <BootstrapTable
        keyField={keyField}
        data={data}
        pagination={pagination}
        columns={columns}
        striped
        wrapperClasses="table-responsive"
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
