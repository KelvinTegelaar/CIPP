import React from 'react'
import PropTypes from 'prop-types'
import { CippDatatable } from './cipp'

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

  handleSelect = ({ selectedRows }) => {
    console.log(selectedRows)
    const { fieldProps, keyField } = this.props
    if (selectedRows != []) {
      fieldProps.input.onChange(selectedRows)
      this.setState(() => ({
        selected: selectedRows.map((el) => el[keyField]),
      }))
    } else {
      fieldProps.input.onChange([])
      this.setState(() => ({
        selected: [],
      }))
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

  render() {
    const { keyField, columns, data } = this.props
    return (
      <CippDatatable
        keyField={keyField}
        data={data}
        columns={columns}
        striped
        path="/api/ListTenants"
        tableProps={{
          selectableRows: true,
          onSelectedRowsChange: this.handleSelect,
          subheader: false,
        }}
      />
    )
  }
}
