import React from 'react'
import moment from 'moment'
import PropTypes from 'prop-types'
import { CTooltip } from '@coreui/react'
import ReactTimeAgo from 'react-time-ago'

/**
 *
 * @param format ['short', 'long', 'relative']
 * @param value
 * @returns {JSX.Element}
 * @constructor
 */
export const CellDate = ({ format = 'short', showTime = true, showDate = true, cell }) => {
  if (!cell || (!showTime && !showDate)) {
    return <div />
  }

  let locale = 'en-GB'
  if (navigator?.language) {
    locale = navigator.language
  }

  // cheatsheet
  // https://devhints.io/wip/intl-datetime
  const dateTimeArgs = [
    [locale, 'default'], // add fallback option if locale doesn't load properly
  ]

  const dateTimeFormatOptions = {}
  if (format == 'relative') {
    try {
      return (
        <CTooltip content={cell}>
          <ReactTimeAgo date={cell} />
        </CTooltip>
      )
    } catch (error) {
      console.error('Error formatting date, fallback to string value', { date: cell, error })
      return (
        <CTooltip content={cell}>
          <div>{String(cell)}</div>
        </CTooltip>
      )
    }
  } else {
    if (showTime) {
      dateTimeFormatOptions.timeStyle = format
    }
    if (showDate) {
      dateTimeFormatOptions.dateStyle = format
    }

    dateTimeArgs.push(dateTimeFormatOptions)

    let formatted

    try {
      // lots of dates returned are unreliably parsable (e.g. non ISO8601 format)
      // fallback using moment to parse into date object
      formatted = new Intl.DateTimeFormat(...dateTimeArgs).format(moment(cell).toDate())
    } catch (error) {
      console.error('Error formatting date, fallback to string value', { date: cell, error })
      formatted = cell
    }

    return (
      <CTooltip content={cell}>
        <div>{String(formatted)}</div>
      </CTooltip>
    )
  }
}

CellDate.propTypes = {
  format: PropTypes.oneOf(['short', 'medium', 'long', 'full', 'relative']),
  cell: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
  showTime: PropTypes.bool,
  showDate: PropTypes.bool,
}

export const cellDateFormatter =
  ({ format = 'short', showTime = true, showDate = true } = {}) =>
  (row, index, column, id) => {
    const cell = column.selector(row)
    return CellDate({ cell, format, showDate, showTime })
  }
