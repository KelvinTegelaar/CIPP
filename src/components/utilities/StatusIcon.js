import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCheckCircle,
  faExclamationTriangle,
  faTimesCircle,
} from '@fortawesome/free-solid-svg-icons'
import PropTypes from 'prop-types'

const IconGreenCheck = () => <FontAwesomeIcon icon={faCheckCircle} className="text-success mx-2" />
const IconRedX = () => <FontAwesomeIcon icon={faTimesCircle} className="text-danger mx-2" />
const IconWarning = () => (
  <FontAwesomeIcon icon={faExclamationTriangle} className="text-warning mx-2" />
)

function StatusIcon(props) {
  if (props.type === 'finalstate') {
    const finalState = props.finalState
    if (finalState === 'Pass') {
      return <IconGreenCheck />
    } else if (finalState === 'Fail') {
      return <IconRedX />
    } else if (finalState === 'Warn') {
      return <IconWarning />
    } else {
      return ''
    }
  } else if (props.type === 'boolean') {
    const status = props.status
    if (status === true) {
      return <IconGreenCheck />
    } else if (status === false) {
      return <IconRedX />
    } else {
      return ''
    }
  } else if (props.type === 'negatedboolean') {
    const status = props.status
    if (status === false) {
      return <IconGreenCheck />
    } else if (status === true) {
      return <IconRedX />
    } else {
      return ''
    }
  }
}

export default StatusIcon

StatusIcon.propTypes = {
  finalState: PropTypes.string,
  status: PropTypes.bool,
  type: PropTypes.string,
}
