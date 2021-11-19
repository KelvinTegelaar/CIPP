import { CFormCheck, CFormInput, CFormLabel, CFormSwitch, CFormText } from '@coreui/react'
import { Field } from 'react-final-form'
import React from 'react'
import PropTypes from 'prop-types'
/*
  wrapper classes for React Final Form with CoreUI
 */

const sharedPropTypes = {
  label: PropTypes.string,
  name: PropTypes.string.isRequired,
  input: {
    name: PropTypes.string,
    value: PropTypes.any,
    onChange: PropTypes.func,
  },
}

export const RFFCFormCheck = (props) => {
  const { name, label } = props
  return (
    <Field name={name}>
      {(props) => (
        <CFormCheck
          id={name}
          label={label}
          value={props.input.value}
          onChange={props.input.onChange}
        />
      )}
    </Field>
  )
}

RFFCFormCheck.propTypes = sharedPropTypes

export const RFFCFormSwitch = (props) => {
  const { name, label } = props
  return (
    <Field name={name}>
      {(props) => (
        <CFormSwitch
          id={name}
          label={label}
          value={props.input.value}
          onChange={props.input.onChange}
        />
      )}
    </Field>
  )
}

RFFCFormSwitch.propTypes = sharedPropTypes

export const RFFCFormText = (props) => {
  const { name, label, type } = props
  return (
    <Field name={name}>
      {(props) => (
        <>
          <CFormLabel htmlFor={name}>{label}</CFormLabel>
          <CFormInput
            type={type}
            id={name}
            area-describedby={name}
            value={props.input.value}
            onChange={props.input.onChange}
          />
        </>
      )}
    </Field>
  )
}
RFFCFormText.propTypes = {
  ...sharedPropTypes,
  type: PropTypes.string,
}
