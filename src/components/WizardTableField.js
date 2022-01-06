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
    path: PropTypes.string.isRequired,
    columns: PropTypes.array.isRequired,
    fieldProps: PropTypes.object,
  }

  static defaultProps = {
    data: [],
    columns: [],
  }

  handleSelect = ({ selectedRows }) => {
    console.log(selectedRows)
    const { fieldProps, keyField } = this.props
    if (selectedRows !== []) {
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
    const { keyField, columns, path } = this.props
    return (
      <CippDatatable
        keyField={keyField}
        columns={columns}
        disablePDFExport={true}
        striped
        path={path}
        tableProps={{
          selectableRows: true,
          onSelectedRowsChange: this.handleSelect,
        }}
      />
    )
  }
}
