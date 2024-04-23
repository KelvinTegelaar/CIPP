import {
  CButton,
  CFormCheck,
  CFormFeedback,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CFormSwitch,
  CFormTextarea,
  CSpinner,
  CTooltip,
} from '@coreui/react'
import Select from 'react-select'
import Creatable, { useCreatable } from 'react-select/creatable'
import { Field } from 'react-final-form'
import { FieldArray } from 'react-final-form-arrays'
import React, { useState, useMemo } from 'react'
import PropTypes from 'prop-types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { debounce } from 'lodash-es'

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
  onClick: PropTypes.func,
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

export const RFFCFormCheck = ({
  name,
  label,
  className = 'mb-3',
  validate,
  disabled = false,
  onClick,
}) => {
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
            onClick={onClick}
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

function ConditionWrapper({ condition, wrapper, children }) {
  return condition ? wrapper(children) : children
}

export const RFFCFormSwitch = ({
  name,
  label,
  helpText,
  sublabel,
  className = 'mb-3',
  validate,
  disabled = false,
  initialValue,
  onClick,
  defaultValue,
}) => {
  return (
    <Field
      defaultValue={defaultValue}
      initialValue={initialValue}
      name={name}
      type="checkbox"
      validate={validate}
    >
      {({ meta, input }) => (
        <ConditionWrapper
          condition={helpText}
          wrapper={(children) => (
            <CTooltip placement="left" content={helpText}>
              {children}
            </CTooltip>
          )}
        >
          <div className={className}>
            <CFormSwitch
              {...input}
              // @todo revisit this, only shows green when checked
              valid={!meta.error && meta.touched && validate}
              invalid={meta.error && meta.touched && validate}
              disabled={disabled}
              id={name}
              label={label}
              onClick={onClick}
            />
            {input.value && <RFFCFormFeedback meta={meta} />}
            <sub>{sublabel}</sub>
          </div>
        </ConditionWrapper>
      )}
    </Field>
  )
}

RFFCFormSwitch.propTypes = {
  ...sharedPropTypes,
  helpText: PropTypes.string,
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
  hiddenValue,
  onChange,
}) => {
  return (
    <Field initialValue={hiddenValue} name={name} validate={validate}>
      {({ input, meta }) => {
        const handleChange = onChange
          ? (e) => {
              input.onChange(e)
              onChange(e)
            }
          : input.onChange
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
              onChange={handleChange}
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
  type: PropTypes.oneOf(['color', 'file', 'text', 'password', 'number']),
  placeholder: PropTypes.string,
}

export const RFFCFormInputArray = ({ name, label, className = 'mb-3' }) => {
  return (
    <>
      <FieldArray name={name}>
        {({ fields }) => (
          <div>
            <div className="mb-2">
              {label && (
                <CFormLabel className="me-2" htmlFor={name}>
                  {label}
                </CFormLabel>
              )}
              <CButton
                onClick={() => fields.push({ Key: '', Value: '' })}
                className="circular-button"
                title={'+'}
              >
                <FontAwesomeIcon icon={'plus'} />
              </CButton>
            </div>
            {fields.map((name, index) => (
              <div key={name} className={className}>
                <div>
                  <Field name={`${name}.Key`} component="input">
                    {({ input, meta }) => {
                      return <CFormInput placeholder="Key" {...input} className="mb-2" />
                    }}
                  </Field>
                  <Field name={`${name}.Value`} component="input">
                    {({ input, meta }) => {
                      return <CFormInput placeholder="Value" {...input} className="mb-2" />
                    }}
                  </Field>
                </div>
                <CButton
                  onClick={() => fields.remove(index)}
                  className={`circular-button`}
                  title={'-'}
                >
                  <FontAwesomeIcon icon={'minus'} />
                </CButton>
              </div>
            ))}
          </div>
        )}
      </FieldArray>
    </>
  )
}
RFFCFormInputArray.propTypes = {
  ...sharedPropTypes,
}

export const RFFCFormRadio = ({
  name,
  label,
  value,
  className = 'mb-3',
  validate,
  disabled = false,
  onClick,
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
            onClick={onClick}
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
  props,
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
            {...props}
          >
            <option value={placeholder}>{placeholder}</option>
            {values.map(({ label, value, ...props }, idx) => (
              <option key={`${idx}-${value}`} value={value} {...props}>
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

export function Condition({ when, is, children, like, regex }) {
  return (
    <>
      {is && (
        <Field name={when} subscription={{ value: true }}>
          {({ input: { value } }) => (value === is ? children : null)}
        </Field>
      )}
      {like && (
        <Field name={when} subscription={{ value: true }}>
          {({ input: { value } }) => (value.includes(like) ? children : null)}
        </Field>
      )}
      {regex && (
        <Field name={when} subscription={{ value: true }}>
          {({ input: { value } }) => (value.match(regex) ? children : null)}
        </Field>
      )}
    </>
  )
}

Condition.propTypes = {
  when: PropTypes.string.isRequired,
  is: PropTypes.any,
  like: PropTypes.string,
  regex: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]),
}

export const RFFSelectSearch = ({
  name,
  label,
  values = [],
  placeholder,
  validate,
  onChange,
  onInputChange,
  multi,
  disabled = false,
  retainInput = true,
  isLoading = false,
  allowCreate = false,
  refreshFunction,
  props,
}) => {
  const [inputText, setInputText] = useState('')
  const selectSearchvalues = values.map((val) => ({
    value: val.value,
    label: val.name,
    ...val.props,
  }))

  const debounceOnInputChange = useMemo(() => {
    if (onInputChange) {
      return debounce(onInputChange, 1000)
    }
  }, [onInputChange])

  const setOnInputChange = (e, action) => {
    if (retainInput && action.action !== 'set-value') {
      setInputText(e)
    }
    if (onInputChange && action.action === 'input-change') {
      debounceOnInputChange(e)
    }
  }

  return (
    <Field name={name} validate={validate}>
      {({ meta, input }) => {
        const handleChange = onChange
          ? (e) => {
              input.onChange(e)
              onChange(e)
            }
          : input.onChange
        return (
          <div>
            <CFormLabel htmlFor={name}>
              {label}
              {refreshFunction && (
                <CTooltip content="Refresh" placement="right">
                  <CButton
                    onClick={refreshFunction}
                    variant="ghost"
                    className="ms-1 py-0 border-0"
                    size="sm"
                  >
                    <FontAwesomeIcon icon="sync" />
                  </CButton>
                </CTooltip>
              )}
            </CFormLabel>
            {!allowCreate && onChange && (
              <Select
                className="react-select-container"
                classNamePrefix="react-select"
                {...input}
                isClearable={false}
                name={name}
                id={name}
                disabled={disabled}
                options={selectSearchvalues}
                placeholder={placeholder}
                isMulti={multi}
                onChange={handleChange}
                onInputChange={debounceOnInputChange}
                inputValue={inputText}
                isLoading={isLoading}
                {...props}
              />
            )}
            {!allowCreate && !onChange && (
              <Select
                className="react-select-container"
                classNamePrefix="react-select"
                {...input}
                isClearable={true}
                name={name}
                id={name}
                disabled={disabled}
                options={selectSearchvalues}
                placeholder={placeholder}
                onInputChange={setOnInputChange}
                isMulti={multi}
                inputValue={inputText}
                isLoading={isLoading}
                {...props}
              />
            )}
            {allowCreate && onChange && (
              <Creatable
                className="react-select-container"
                classNamePrefix="react-select"
                {...input}
                isClearable={false}
                name={name}
                id={name}
                disabled={disabled}
                options={selectSearchvalues}
                placeholder={placeholder}
                isMulti={multi}
                onChange={handleChange}
                onInputChange={debounceOnInputChange}
                inputValue={inputText}
                isLoading={isLoading}
                {...props}
              />
            )}
            {allowCreate && !onChange && (
              <Creatable
                className="react-select-container"
                classNamePrefix="react-select"
                {...input}
                isClearable={true}
                name={name}
                id={name}
                disabled={disabled}
                options={selectSearchvalues}
                placeholder={placeholder}
                onInputChange={setOnInputChange}
                isMulti={multi}
                inputValue={inputText}
                isLoading={isLoading}
                {...props}
              />
            )}
            {meta.error && meta.touched && <span className="text-danger">{meta.error}</span>}
          </div>
        )
      }}
    </Field>
  )
}

RFFSelectSearch.propTypes = {
  ...sharedPropTypes,
  multi: PropTypes.bool,
  placeholder: PropTypes.string,
  onInputChange: PropTypes.func,
  isLoading: PropTypes.bool,
  refreshFunction: PropTypes.func,
  values: PropTypes.arrayOf(PropTypes.shape({ value: PropTypes.string, name: PropTypes.string }))
    .isRequired,
}
