import XCircleIcon from '@heroicons/react/24/outline/XCircleIcon';
import {
  createTheme,
  filledInputClasses,
  inputAdornmentClasses,
  inputBaseClasses,
  inputLabelClasses,
  SvgIcon,
  switchClasses,
  tableCellClasses
} from '@mui/material';

// Used only to create transitions
const muiTheme = createTheme();

export const createComponents = () => {
  return {
    MuiAutocomplete: {
      styleOverrides: {
        root: {
          [`& .${filledInputClasses.root}`]: {
            paddingTop: 6
          }
        },
        noOptions: {
          fontSize: 14,
          letterSpacing: 0.15,
          lineHeight: 1.6
        },
        option: {
          fontSize: 14,
          letterSpacing: 0.15,
          lineHeight: 1.6
        }
      }
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          fontSize: 14,
          fontWeight: 600,
          letterSpacing: 0
        }
      }
    },
    MuiButton: {
      defaultProps: {
        disableRipple: true
      },
      styleOverrides: {
        root: {
          fontWeight: 600
        },
        sizeLarge: {
          fontSize: 15
        },
        sizeMedium: {
          fontSize: 14
        },
        sizeSmall: {
          fontSize: 13
        }
      }
    },
    MuiButtonGroup: {
      defaultProps: {
        disableRipple: true
      }
    },
    MuiCardActions: {
      styleOverrides: {
        root: {
          paddingBottom: 16,
          paddingLeft: 24,
          paddingRight: 24,
          paddingTop: 16
        }
      }
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          paddingBottom: 20,
          paddingLeft: 24,
          paddingRight: 24,
          paddingTop: 20
        }
      }
    },
    MuiCardHeader: {
      styleOverrides: {
        root: {
          paddingBottom: 16,
          paddingLeft: 24,
          paddingRight: 24,
          paddingTop: 16
        },
        subheader: {
          fontSize: 14
        },
        title: {
          fontSize: 16
        }
      }
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: 'transparent'
          }
        }
      }
    },
    MuiChip: {
      defaultProps: {
        deleteIcon: (
          <SvgIcon>
            <XCircleIcon />
          </SvgIcon>
        )
      },
      styleOverrides: {
        avatar: {
          borderRadius: 6
        },
        root: {
          borderRadius: 6,
          fontWeight: 400,
          letterSpacing: 0
        }
      }
    },
    MuiCssBaseline: {
      styleOverrides: {
        '*': {
          boxSizing: 'border-box'
        },
        html: {
          MozOsxFontSmoothing: 'grayscale',
          WebkitFontSmoothing: 'antialiased',
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100%',
          width: '100%'
        },
        body: {
          display: 'flex',
          flex: '1 1 auto',
          flexDirection: 'column',
          minHeight: '100%',
          width: '100%'
        },
        '#__next': {
          display: 'flex',
          flex: '1 1 auto',
          flexDirection: 'column',
          height: '100%',
          width: '100%'
        },
        '#nprogress': {
          pointerEvents: 'none'
        },
        '#nprogress .bar': {
          backgroundColor: '#12B76A',
          height: 3,
          left: 0,
          position: 'fixed',
          top: 0,
          width: '100%',
          zIndex: 2000
        }
      }
    },
    MuiDialogActions: {
      styleOverrides: {
        root: {
          paddingBottom: 32,
          paddingLeft: 32,
          paddingRight: 32,
          paddingTop: 24,
          '&>:not(:first-of-type)': {
            marginLeft: 16
          }
        }
      }
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          paddingBottom: 8,
          paddingLeft: 32,
          paddingRight: 32,
          paddingTop: 8
        }
      }
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          fontSize: 24,
          fontWeight: 600,
          paddingBottom: 24,
          paddingLeft: 32,
          paddingRight: 32,
          paddingTop: 32
        }
      }
    },
    MuiFormControlLabel: {
      styleOverrides: {
        label: {
          fontSize: 14,
          letterSpacing: 0.15,
          lineHeight: 1.43
        }
      }
    },
    MuiIcon: {
      styleOverrides: {
        fontSizeLarge: {
          fontSize: 32
        }
      }
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          padding: 8
        },
        sizeSmall: {
          padding: 4
        }
      }
    },
    MuiInputAdornment: {
      styleOverrides: {
        root: {
          [`&.${inputAdornmentClasses.positionStart}.${inputAdornmentClasses.filled}`]: {
            '&:not(.MuiInputAdornment-hiddenLabel)': {
              marginTop: 0
            }
          }
        }
      }
    },
    MuiInputBase: {
      styleOverrides: {
        input: {
          '&::placeholder': {
            opacity: 1
          },
          [`label[data-shrink=false] + .${inputBaseClasses.formControl} &`]: {
            '&::placeholder': {
              opacity: 1 + '!important'
            }
          }
        }
      }
    },
    MuiFilledInput: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          borderStyle: 'solid',
          borderWidth: 1,
          overflow: 'hidden',
          padding: '6px 12px',
          transition: muiTheme.transitions.create([
            'border-color',
            'box-shadow'
          ]),
          '&:before': {
            display: 'none'
          },
          '&:after': {
            display: 'none'
          }
        },
        input: {
          padding: 0,
          height: 'unset',
          fontSize: 14,
          fontWeight: 500,
          lineHeight: 1.6
        }
      }
    },
    MuiFormLabel: {
      styleOverrides: {
        root: {
          fontSize: 14,
          fontWeight: 500,
          [`&.${inputLabelClasses.filled}`]: {
            marginBottom: 8,
            position: 'relative',
            transform: 'none'
          }
        }
      }
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          marginRight: '16px',
          minWidth: 'unset'
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none'
        }
      }
    },
    MuiRadio: {
      styleOverrides: {
        root: {
          transition: 'color 250ms',
          '&:hover': {
            backgroundColor: 'transparent'
          }
        }
      }
    },
    MuiSelect: {
      defaultProps: {
        variant: 'filled'
      },
      styleOverrides: {
        filled: {
          '&:focus': {
            backgroundColor: 'transparent'
          }
        }
      }
    },
    MuiSkeleton: {
      styleOverrides: {
        root: {
          borderRadius: 4
        }
      }
    },
    MuiSvgIcon: {
      styleOverrides: {
        fontSizeLarge: {
          fontSize: 32
        }
      }
    },
    MuiSwitch: {
      styleOverrides: {
        root: {
          borderRadius: 48,
          height: 24,
          marginBottom: 8,
          marginLeft: 8,
          marginRight: 8,
          marginTop: 8,
          padding: 0,
          width: 44
        },
        switchBase: {
          padding: 4,
          '&:hover': {
            backgroundColor: 'transparent'
          },
          [`&.${switchClasses.checked}+.${switchClasses.track}`]: {
            opacity: 1
          },
          [`&.${switchClasses.disabled}+.${switchClasses.track}`]: {
            opacity: 1
          },
          [`&.${switchClasses.checked}.${switchClasses.disabled}+.${switchClasses.track}`]: {
            opacity: 0.5
          }
        },
        track: {
          opacity: 1
        },
        thumb: {
          height: 16,
          width: 16
        }
      }
    },
    MuiTab: {
      defaultProps: {
        disableRipple: true
      },
      styleOverrides: {
        root: {
          fontSize: 14,
          letterSpacing: 0.15,
          lineHeight: 1.71
        }
      }
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          [`&.${tableCellClasses.root}`]: {
            fontSize: 11,
            fontWeight: 600,
            textTransform: 'uppercase'
          }
        }
      }
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          [`&:last-of-type .${tableCellClasses.root}`]: {
            borderWidth: 0
          }
        }
      }
    },
    MuiTextField: {
      defaultProps: {
        variant: 'filled'
      }
    }
  };
};
