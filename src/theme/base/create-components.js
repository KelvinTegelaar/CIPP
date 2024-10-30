import XCircleIcon from "@heroicons/react/24/outline/XCircleIcon";
import {
  createTheme,
  filledInputClasses,
  inputAdornmentClasses,
  inputLabelClasses,
  SvgIcon,
  switchClasses,
  tableCellClasses,
} from "@mui/material";

// Used only to create transitions
const muiTheme = createTheme();

export const createComponents = () => {
  return {
    MuiAutocomplete: {
      styleOverrides: {
        root: {
          [`& .${filledInputClasses.root}`]: {
            paddingTop: 6,
            paddingBottom: 6,
            minHeight: "40px", // Ensure consistent height
          },
        },
        inputRoot: {
          padding: "6px 12px", // Consistent padding with inputs
        },
        noOptions: {
          fontSize: 14,
          letterSpacing: 0.15,
          lineHeight: 1.6,
        },
        option: {
          fontSize: 14,
          letterSpacing: 0.15,
          lineHeight: 1.6,
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          fontSize: 14,
          fontWeight: 600,
          letterSpacing: 0,
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableRipple: true,
      },
      styleOverrides: {
        root: {
          fontWeight: 600,
        },
        sizeLarge: {
          fontSize: 15,
        },
        sizeMedium: {
          fontSize: 14,
        },
        sizeSmall: {
          fontSize: 13,
        },
      },
    },
    MuiButtonGroup: {
      defaultProps: {
        disableRipple: true,
      },
    },
    MuiCardActions: {
      styleOverrides: {
        root: {
          paddingBottom: 16,
          paddingLeft: 24,
          paddingRight: 24,
          paddingTop: 16,
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          paddingBottom: 20,
          paddingLeft: 24,
          paddingRight: 24,
          paddingTop: 20,
        },
      },
    },
    MuiCardHeader: {
      styleOverrides: {
        root: {
          paddingBottom: 16,
          paddingLeft: 24,
          paddingRight: 24,
          paddingTop: 16,
        },
        subheader: {
          fontSize: 14,
        },
        title: {
          fontSize: 16,
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          "&:hover": {
            backgroundColor: "transparent",
          },
        },
      },
    },
    MuiChip: {
      defaultProps: {
        deleteIcon: (
          <SvgIcon>
            <XCircleIcon />
          </SvgIcon>
        ),
      },
      styleOverrides: {
        avatar: {
          borderRadius: 6,
        },
        root: {
          borderRadius: 6,
          fontWeight: 400,
          letterSpacing: 0,
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        "*": {
          boxSizing: "border-box",
        },
        html: {
          MozOsxFontSmoothing: "grayscale",
          WebkitFontSmoothing: "antialiased",
          display: "flex",
          flexDirection: "column",
          minHeight: "100%",
          width: "100%",
        },
        body: {
          display: "flex",
          flex: "1 1 auto",
          flexDirection: "column",
          minHeight: "100%",
          width: "100%",
        },
        "#__next": {
          display: "flex",
          flex: "1 1 auto",
          flexDirection: "column",
          height: "100%",
          width: "100%",
        },
        "#nprogress": {
          pointerEvents: "none",
        },
        "#nprogress .bar": {
          backgroundColor: "#12B76A",
          height: 3,
          left: 0,
          position: "fixed",
          top: 0,
          width: "100%",
          zIndex: 2000,
        },
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: {
          paddingBottom: 32,
          paddingLeft: 32,
          paddingRight: 32,
          paddingTop: 24,
          "&>:not(:first-of-type)": {
            marginLeft: 16,
          },
        },
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          paddingBottom: 8,
          paddingLeft: 32,
          paddingRight: 32,
          paddingTop: 8,
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          fontSize: 24,
          fontWeight: 600,
          paddingBottom: 24,
          paddingLeft: 32,
          paddingRight: 32,
          paddingTop: 32,
        },
      },
    },
    MuiFormControlLabel: {
      styleOverrides: {
        label: {
          fontSize: 14,
          letterSpacing: 0.15,
          lineHeight: 1.43,
        },
      },
    },
    MuiIcon: {
      styleOverrides: {
        fontSizeLarge: {
          fontSize: 32,
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          padding: 8,
        },
        sizeSmall: {
          padding: 4,
        },
      },
    },
    MuiInputAdornment: {
      styleOverrides: {
        root: {
          [`&.${inputAdornmentClasses.positionStart}`]: {
            marginRight: 8, // Adjust spacing between the input and adornment
            padding: "0 8px", // Add padding to better align with input field
            height: "100%", // Ensure adornment height matches the input
            display: "flex",
            alignItems: "center", // Center the adornment vertically
          },
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          height: "40px", // Force height to match Autocomplete
        },
        input: {
          fontSize: 14,
          padding: "6px 12px", // Match padding with Autocomplete
        },
      },
    },
    MuiFilledInput: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          borderStyle: "solid",
          borderWidth: 1,
          borderColor: "rgba(0, 0, 0, 0.23)", // Default border color
          overflow: "hidden",
          padding: "6px 12px", // Match padding with Autocomplete
          height: "40px", // Force height to match Autocomplete
          transition: muiTheme.transitions.create(["border-color", "box-shadow"]),
          "&:before": {
            display: "none", // Disable the default underline on focus/hover
          },
          "&:after": {
            display: "none", // Disable the bottom line after focus
          },
          "&.Mui-focused": {
            borderColor: "#1976d2", // Highlight border on focus
            boxShadow: "0px 0px 0px 2px rgba(25, 118, 210, 0.25)", // Subtle shadow on focus
          },
        },
        input: {
          padding: 0,
          fontSize: 14,
          height: "unset",
          fontWeight: 500,
          lineHeight: 1.6,
        },
      },
    },
    MuiFormLabel: {
      styleOverrides: {},
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          marginRight: "16px",
          minWidth: "unset",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },
    MuiRadio: {
      styleOverrides: {
        root: {
          transition: "color 250ms",
          "&:hover": {
            backgroundColor: "transparent",
          },
        },
      },
    },
    MuiSelect: {
      defaultProps: {
        variant: "filled",
      },
      styleOverrides: {
        filled: {
          "&:focus": {
            backgroundColor: "transparent",
          },
        },
      },
    },
    MuiSkeleton: {
      styleOverrides: {
        root: {
          borderRadius: 4,
        },
      },
    },
    MuiSvgIcon: {
      styleOverrides: {
        fontSizeLarge: {
          fontSize: 32,
        },
      },
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
          width: 44,
        },
        switchBase: {
          padding: 4,
          "&:hover": {
            backgroundColor: "transparent",
          },
          [`&.${switchClasses.checked}+.${switchClasses.track}`]: {
            opacity: 1,
          },
          [`&.${switchClasses.disabled}+.${switchClasses.track}`]: {
            opacity: 1,
          },
          [`&.${switchClasses.checked}.${switchClasses.disabled}+.${switchClasses.track}`]: {
            opacity: 0.5,
          },
        },
        track: {
          opacity: 1,
        },
        thumb: {
          height: 16,
          width: 16,
        },
      },
    },
    MuiTab: {
      defaultProps: {
        disableRipple: true,
      },
      styleOverrides: {
        root: {
          fontSize: 14,
          letterSpacing: 0.15,
          lineHeight: 1.71,
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          [`&.${tableCellClasses.root}`]: {
            fontSize: 11,
            fontWeight: 600,
            textTransform: "uppercase",
          },
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          [`&:last-of-type .${tableCellClasses.root}`]: {
            borderWidth: 0,
          },
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: "filled",
      },
      styleOverrides: {
        root: {
          height: "40px", // Force height to match Autocomplete
        },
      },
    },
  };
};
