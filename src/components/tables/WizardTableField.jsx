import React from 'react'
import PropTypes from 'prop-types'
import { CippDatatable } from 'src/components/tables'

/**
 * Table with checkboxes
 * @param props
 * @returns {JSX.Element}
 * @constructor
 */
export default class WizardTableField extends React.Component {
  static propTypes = {
    reportName: PropTypes.string.isRequired,
    keyField: PropTypes.string.isRequired,
    path: PropTypes.string.isRequired,
    params: PropTypes.object,
    columns: PropTypes.array.isRequired,
    fieldProps: PropTypes.object,
  }

  static defaultProps = {
    data: [],
    columns: [],
  }

  handleSelect = ({ selectedRows = [] }) => {
    // console.log(selectedRows)
    const { fieldProps, keyField } = this.props
    if (selectedRows.length > 0) {
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
    const { reportName, keyField, columns, path, params, ...props } = this.props
    return (
      <CippDatatable
        reportName={reportName}
        keyField={keyField}
        columns={columns}
        actions={false}
        striped
        path={path}
        params={params}
        disablePDFExport={true}
        disableCSVExport={true}
        tableProps={{
          selectableRows: true,
          onSelectedRowsChange: this.handleSelect,
        }}
        dynamicColumns={false}
        {...props}
      />
    )
  }
}
