import { useCallback, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import MagnifyingGlassIcon from '@heroicons/react/24/outline/MagnifyingGlassIcon';
import { InputBase, SvgIcon } from '@mui/material';
import { styled } from '@mui/material/styles';

const QueryFieldRoot = styled('div')((({ theme }) => ({
  alignItems: 'center',
  backgroundColor: 'background.paper',
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  display: 'flex',
  height: 42,
  padding: '0 16px'
})));

export const QueryField = (props) => {
  const { disabled, onChange, placeholder, value: initialValue = '', ...other } = props;
  const [autoFocus, setAutoFocus] = useState(false);
  const inputRef = useRef(null);
  const [value, setValue] = useState('');

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
      if (!disabled && autoFocus && inputRef?.current) {
        inputRef.current.focus();
      }
    },
    [disabled]);

  const handleChange = useCallback((event) => {
    setValue(event.target.value);
  }, []);

  const handleKeyup = useCallback((event) => {
    if (event.code === 'Enter') {
      onChange?.(value);
    }
  }, [value, onChange]);

  const handleFocus = useCallback(() => {
    setAutoFocus(true);
  }, []);

  const handleBlur = useCallback((event) => {
    /*
     There is a situation where an input goes from not disabled to disabled and DOM emits a blur
     event, with event as undefined. This means, that sometimes we'll receive an React Synthetic
     event and sometimes undefined because when DOM triggers the event, React is unaware of it,
     or it simply does not emit the event. To bypass this behaviour, we store a local variable
     that acts as autofocus.
     */

    if (event) {
      setAutoFocus(false);
    }
  }, []);

  return (
    <QueryFieldRoot {...other}>
      <SvgIcon
        fontSize="small"
        sx={{ mr: 1 }}
      >
        <MagnifyingGlassIcon />
      </SvgIcon>
      <InputBase
        disabled={disabled}
        inputProps={{ ref: inputRef }}
        onBlur={handleBlur}
        onChange={handleChange}
        onFocus={handleFocus}
        onKeyUp={handleKeyup}
        placeholder={placeholder}
        sx={{ flexGrow: 1 }}
        value={value}
      />
    </QueryFieldRoot>
  );
};

QueryField.propTypes = {
  disabled: PropTypes.bool,
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
  value: PropTypes.string
};
