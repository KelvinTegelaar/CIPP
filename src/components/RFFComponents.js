import {
  CFormCheck,
  CFormFeedback,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CFormSwitch,
  CFormTextarea,
} from '@coreui/react'
import SelectSearch, { fuzzySearch } from 'react-select-search'
import { Field } from 'react-final-form'
import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'

/*
  wrapper classes for React Final Form with CoreUI
 */
const sharedPropTypes = {
  name: PropTypes.string.isRequired,
  className: PropTypes.string,
  label: PropTypes.string,
  validate: PropTypes.func,
  disabled: PropTypes.bool,
  input: PropTypes.shape({
    name: PropTypes.string,
    value: PropTypes.any,
    onChange: PropTypes.func,
    meta: PropTypes.shape({
      touched: PropTypes.bool,
      error: PropTypes.any,
    }),
  }),
}

export const RFFCFormFeedback = ({ meta }) => {
  return (
    <CFormFeedback invalid={meta.error && meta.touched} valid={!meta.error && meta.touched}>
      {meta.touched && meta.error}
    </CFormFeedback>
  )
}

RFFCFormFeedback.propTypes = {
  meta: PropTypes.shape({
    error: PropTypes.any,
    touched: PropTypes.bool,
  }),
}

export const RFFCFormCheck = ({ name, label, className = 'mb-3', validate, disabled = false }) => {
  return (
    <Field name={name} type="checkbox" validate={validate}>
      {({ input, meta }) => (
        <div className={className}>
          <CFormCheck
            {...input}
            // @todo revisit this, only shows green when checked
            valid={!meta.error && meta.touched && validate}
            invalid={meta.error && meta.touched && validate}
            disabled={disabled}
            id={name}
            label={label}
          />
          <RFFCFormFeedback meta={meta} />
        </div>
      )}
    </Field>
  )
}

RFFCFormCheck.propTypes = {
  ...sharedPropTypes,
}

export const RFFCFormSwitch = ({ name, label, className = 'mb-3', validate, disabled = false }) => {
  return (
    <Field name={name} type="checkbox" validate={validate}>
      {({ meta, input }) => (
        <div className={className}>
          <CFormSwitch
            {...input}
            // @todo revisit this, only shows green when checked
            valid={!meta.error && meta.touched && validate}
            invalid={meta.error && meta.touched && validate}
            disabled={disabled}
            id={name}
            label={label}
          />
          {input.value && <RFFCFormFeedback meta={meta} />}
        </div>
      )}
    </Field>
  )
}

RFFCFormSwitch.propTypes = {
  ...sharedPropTypes,
}

export const RFFCFormInput = ({
  name,
  label,
  type = 'text',
  placeholder,
  className = 'mb-3',
  validate,
  disabled = false,
  spellCheck = true,
  autoFocus = false,
}) => {
  return (
    <Field name={name} validate={validate}>
      {({ input, meta }) => {
        return (
          <div className={className}>
            {label && <CFormLabel htmlFor={name}>{label}</CFormLabel>}
            <CFormInput
              {...input}
              valid={!meta.error && meta.touched}
              invalid={meta.error && meta.touched}
              type={type}
              id={name}
              disabled={disabled}
              area-describedby={name}
              placeholder={placeholder}
              spellCheck={spellCheck}
              autoFocus={autoFocus}
            />
            <RFFCFormFeedback meta={meta} />
          </div>
        )
      }}
    </Field>
  )
}
RFFCFormInput.propTypes = {
  ...sharedPropTypes,
  type: PropTypes.oneOf(['color', 'file', 'text', 'password']),
  placeholder: PropTypes.string,
}

export const RFFCFormRadio = ({
  name,
  label,
  value,
  className = 'mb-3',
  validate,
  disabled = false,
}) => {
  return (
    <Field name={name} type="radio" value={value} validate={validate}>
      {({ meta, input }) => (
        <div className={className}>
          <CFormCheck
            {...input}
            valid={!meta.error && meta.touched}
            invalid={meta.error && meta.touched}
            disabled={disabled}
            type="radio"
            name={name}
            label={label}
          />
          <RFFCFormFeedback meta={meta} />
        </div>
      )}
    </Field>
  )
}

RFFCFormRadio.propTypes = {
  ...sharedPropTypes,
}

export const RFFCFormTextarea = ({
  name,
  label,
  value,
  placeholder,
  className = 'mb-3',
  validate,
  disabled = false,
}) => {
  return (
    <Field name={name} value={value} validate={validate}>
      {({ meta, input }) => {
        return (
          <div className={className}>
            <CFormLabel htmlFor={name}>{label}</CFormLabel>
            <CFormTextarea
              {...input}
              valid={!meta.error && meta.touched}
              invalid={meta.error && meta.touched}
              disabled={disabled}
              id={name}
              placeholder={placeholder}
              //value={value}
            />
            <RFFCFormFeedback meta={meta} />
          </div>
        )
      }}
    </Field>
  )
}

RFFCFormTextarea.propTypes = {
  ...sharedPropTypes,
  placeholder: PropTypes.string,
}

export const RFFCFormSelect = ({
  name,
  label,
  values = [],
  placeholder,
  className = 'mb-3',
  validate,
  disabled = false,
}) => {
  // handler for ignoring the first element ('the placeholder')
  const selectValidate = (value, allValues, meta) => {
    if (validate) {
      if (value !== placeholder) {
        return validate(value, allValues, meta)
      }
      return null
    }
  }

  return (
    <Field name={name} validate={selectValidate}>
      {({ input, meta }) => (
        <div className={className}>
          {label && <CFormLabel>{label}</CFormLabel>}
          <CFormSelect
            {...input}
            valid={!meta.error && meta.touched}
            invalid={meta.error && meta.touched}
            disabled={disabled}
          >
            <option value={placeholder}>{placeholder}</option>
            {values.map(({ label, value }, idx) => (
              <option key={`${idx}-${value}`} value={value}>
                {label}
              </option>
            ))}
          </CFormSelect>
          <RFFCFormFeedback meta={meta} />
        </div>
      )}
    </Field>
  )
}

RFFCFormSelect.propTypes = {
  ...sharedPropTypes,
  placeholder: PropTypes.string.isRequired,
  values: PropTypes.arrayOf(PropTypes.shape({ label: PropTypes.string, value: PropTypes.any })),
}

export function Condition({ when, is, children }) {
  return (
    <Field name={when} subscription={{ value: true }}>
      {({ input: { value } }) => (value === is ? children : null)}
    </Field>
  )
}

Condition.propTypes = {
  when: PropTypes.string.isRequired,
  is: PropTypes.any,
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]),
}

const RFFSelectSearchClasses = {
  container: 'form-select is-valid',
  value: 'select-search__value',
  input: 'select-search__input form-select',
  select: 'select-search__select',
  row: 'select-search__row',
  options: 'select-search__options',
  option: 'select-search__option',
  group: 'select-search__group',
  'group-header': 'select-search__group-header',
  'is-selected': 'select-search.is-selected',
  'is-highlighted': 'select-search.is-highlighted',
  'is-loading': 'select-search.is-loading',
  'has-focus': 'select-search.has-focus',
}

export const RFFSelectSearch = ({
  name,
  label,
  values = [],
  placeholder,
  validate,
  onChange,
  disabled = false,
}) => {
  return (
    <Field name={name} validate={validate}>
      {({ meta, input }) => {
        return (
          <div>
            <CFormLabel htmlFor={name}>{label}</CFormLabel>
            <SelectSearch
              {...input}
              valid={!meta.error && meta.touched}
              invalid={meta.error && meta.touched}
              search
              name={name}
              id={name}
              // @todo fix this override so the styling is the same as coreui or override render?
              className={(key) => {
                if (key === 'container') {
                  return classNames('form-select', {
                    'is-valid': !meta.error && meta.touched,
                    'is-invalid': meta.error && meta.touched,
                  })
                }
                return RFFSelectSearchClasses[key]
              }}
              disabled={disabled}
              options={values}
              filterOptions={fuzzySearch}
              value={input.value}
              //commented out this on change, because even when it was not set it was using the value, causing issues with the event.
              onChange={input.onChange}
              placeholder={placeholder}
            />
            <RFFCFormFeedback meta={meta} />
          </div>
        )
      }}
    </Field>
  )
}

RFFSelectSearch.propTypes = {
  ...sharedPropTypes,
  placeholder: PropTypes.string,
  values: PropTypes.arrayOf(PropTypes.shape({ value: PropTypes.string, name: PropTypes.string }))
    .isRequired,
}
