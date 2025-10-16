import {
  filledInputClasses,
  paperClasses,
  radioClasses,
  switchClasses,
  tableCellClasses,
  inputLabelClasses,
  tableRowClasses,
} from "@mui/material";
import { common } from "@mui/material/colors";
import { alpha } from "@mui/material/styles";

export const createComponents = ({ palette }) => {
  return {
    MuiAutocomplete: {
      styleOverrides: {
        paper: {
          borderWidth: 1,
          borderStyle: "solid",
          borderColor: palette.neutral[600],
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          backgroundColor: palette.neutral[800],
          color: palette.text.secondary,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          "&:focus": {
            boxShadow: `${alpha(palette.primary.main, 0.25)} 0 0 0 0.2rem`,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          [`&.${paperClasses.elevation1}`]: {
            boxShadow: `0px 0px 1px ${palette.neutral[800]}, 0px 1px 3px ${alpha(
              palette.neutral[900],
              0.12
            )}`,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        avatar: {
          backgroundColor: palette.neutral[800],
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        input: {
          "&::placeholder": {
            color: palette.text.secondary,
          },
        },
      },
    },
    MuiFilledInput: {
      styleOverrides: {
        root: {
          backgroundColor: palette.background.paper,
          borderColor: palette.neutral[600],
          boxShadow: `0px 1px 2px 0px ${alpha(palette.neutral[900], 0.08)}`,
          "&:hover": {
            backgroundColor: palette.action.hover,
          },
          [`&.${filledInputClasses.disabled}`]: {
            backgroundColor: palette.action.disabledBackground,
            borderColor: palette.neutral[800],
            boxShadow: "none",
          },
          [`&.${filledInputClasses.focused}`]: {
            backgroundColor: "transparent",
            borderColor: palette.primary.main,
            boxShadow: `${alpha(palette.primary.main, 0.25)} 0 0 0 0.2rem`,
          },
          [`&.${filledInputClasses.error}`]: {
            borderColor: palette.error.main,
            boxShadow: `${alpha(palette.error.main, 0.25)} 0 0 0 0.2rem`,
          },
        },
      },
    },
    MuiFormLabel: {
      styleOverrides: {
        root: {
          color: palette.text.secondary,
          [`&.${inputLabelClasses.shrink}`]: {
            backgroundColor:
              palette.mode === "dark" ? palette.background.paper : palette.background.default,
            padding: "0 8px", // Make the label background a bit wider
            transform: "translate(12px, -6px) scale(0.75)", // Label moves up when input is focused or filled
          },
          [`&.Mui-focused`]: {
            backgroundColor: palette.primary.main, // Set the background to primary color when selected
            color: palette.primary.contrastText, // Change the text color to contrast with the background
            padding: "0 8px", // Keep the padding to ensure background width
          },
        },
      },
    },
    MuiRadio: {
      defaultProps: {
        checkedIcon: (
          <svg
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect width="18" height="18" rx="9" fill="currentColor" />
            <rect x="2" y="2" width="14" height="14" rx="7" fill="currentColor" />
            <rect x="5" y="5" width="8" height="8" rx="4" fill={palette.background?.paper} />
          </svg>
        ),
        icon: (
          <svg
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect width="18" height="18" rx="9" fill="currentColor" />
            <rect x="2" y="2" width="14" height="14" rx="7" fill={palette.background.paper} />
          </svg>
        ),
      },
      styleOverrides: {
        root: {
          color: palette.text.secondary,
          [`&:hover:not(.${radioClasses.checked})`]: {
            color: palette.text.primary,
          },
        },
      },
    },
    MuiSkeleton: {
      styleOverrides: {
        root: {
          backgroundColor: palette.neutral[600],
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        root: {
          "&:focus-within": {
            boxShadow: `${alpha(palette.primary.main, 0.25)} 0 0 0 0.2rem`,
          },
        },
        switchBase: {
          [`&.${switchClasses.disabled}`]: {
            [`&+.${switchClasses.track}`]: {
              backgroundColor: alpha(palette.text.primary, 0.08),
            },
            [`& .${switchClasses.thumb}`]: {
              backgroundColor: alpha(palette.text.secondary, 0.86),
            },
          },
        },
        track: {
          backgroundColor: palette.neutral[500],
        },
        thumb: {
          backgroundColor: common.white,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottomWidth: 1,
          borderBottomStyle: "solid",
          borderBottomColor: palette.neutral[800],
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: palette.neutral[900],
          borderBottomWidth: 1,
          borderBottomStyle: "solid",
          borderBottomColor: palette.neutral[800],
          [`.${tableCellClasses.root}`]: {
            color: palette.text.secondary,
          },
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          [`&.${tableRowClasses.hover}`]: {
            backgroundColor: palette.neutral[900],
          },
        },
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          borderColor: palette.neutral[700],
        },
      },
    },
  };
};
