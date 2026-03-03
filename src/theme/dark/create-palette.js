import { common } from '@mui/material/colors';
import { alpha } from '@mui/material/styles';
import { error, info, neutral, success, warning } from '../colors';
import { getPrimary } from '../utils';

export const createPalette = (config) => {
  const { colorPreset, contrast } = config;

  return {
    action: {
      active: neutral[400],
      disabled: alpha(neutral[400], 0.38),
      disabledBackground: alpha(neutral[400], 0.12),
      focus: alpha(neutral[400], 0.16),
      hover: alpha(neutral[400], 0.04),
      selected: alpha(neutral[400], 0.12)
    },
    background: {
      default: contrast === 'high' ? '#0A0F18' : '#0C121D',
      paper: '#101826'
    },
    divider: neutral[800],
    error,
    info,
    mode: 'dark',
    neutral,
    primary: getPrimary(colorPreset),
    success,
    text: {
      primary: common.white,
      secondary: '#97A1BA',
      disabled: alpha(common.white, 0.38)
    },
    warning
  };
};
