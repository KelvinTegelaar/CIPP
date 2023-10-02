import React from 'react'
import moment from 'moment'
import PropTypes from 'prop-types'
import { CTooltip } from '@coreui/react'
import ReactTimeAgo from 'react-time-ago'

export const CellDate = ({ format = 'short', showTime = true, showDate = true, cell }) => {
  if (!cell || (!showTime && !showDate)) {
    return <div />
  }

  let locale = 'en-GB'
  if (navigator?.language) {
    locale = navigator.language
  }

  // Convert cell value to a number and check if it's a Unix timestamp
  const possibleUnixTimestamp = Number(cell)
  const isUnixTimestamp = !isNaN(possibleUnixTimestamp) && possibleUnixTimestamp > 1000000000
  let dateObject

  if (isUnixTimestamp) {
    dateObject = moment.unix(possibleUnixTimestamp).toDate()
  } else {
    dateObject = moment(cell).toDate()
  }

  const dateTimeArgs = [[locale, 'default']]

  const dateTimeFormatOptions = {}

  if (format === 'relative') {
    try {
      return <ReactTimeAgo date={dateObject} />
    } catch (error) {
      console.error('Error formatting date, fallback to string value', { date: dateObject, error })
      return (
        <CTooltip content={dateObject.toString()}>
          <div>{String(dateObject)}</div>
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
      formatted = new Intl.DateTimeFormat(...dateTimeArgs).format(dateObject)
    } catch (error) {
      console.error('Error formatting date, fallback to string value', { date: dateObject, error })
      formatted = dateObject.toString()
    }

    return (
      <CTooltip content={dateObject.toString()}>
        <div>{String(formatted)}</div>
      </CTooltip>
    )
  }
}

CellDate.propTypes = {
  format: PropTypes.oneOf(['short', 'medium', 'long', 'full', 'relative']),
  cell: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.instanceOf(Date)]),
  showTime: PropTypes.bool,
  showDate: PropTypes.bool,
}

export const cellDateFormatter =
  ({ format = 'short', showTime = true, showDate = true } = {}) =>
  (row, index, column, id) => {
    const cell = column.selector(row)
    return CellDate({ cell, format, showDate, showTime })
  }
