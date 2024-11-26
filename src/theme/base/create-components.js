import XCircleIcon from "@heroicons/react/24/outline/XCircleIcon";
import {
  createTheme,
  filledInputClasses,
  inputAdornmentClasses,
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
          },
        },
        inputRoot: {
          minHeight: "42px",
          paddingTop: 6,
          paddingBottom: 6,
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
            height: "100%", // Ensure adornment height matches the input
            display: "flex",
            alignItems: "center", // Center the adornment vertically
          },
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        input: {
          fontSize: 14,
          height: "40px", // Apply height only to single-line inputs
          "&.MuiInputBase-inputMultiline": {
            height: "unset", // Allow textareas to be flexible
          },
          "&.MuiAutocomplete-input": {
            height: "unset", // Allow autocomplete to be flexible
          },
          "&.MuiOutlinedInput-input": {
            padding: 0, // remove extra padding on outlined input
          },
        },
      },
    },
    MuiFilledInput: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          borderStyle: "solid",
          borderWidth: 1,
          borderColor: "rgba(0, 0, 0, 0.23)",
          overflow: "hidden",
          transition: muiTheme.transitions.create(["border-color", "box-shadow"]),
          "&:before": {
            display: "none",
          },
          "&:after": {
            display: "none",
          },
          "&.Mui-focused": {
            borderColor: "#1976d2",
            boxShadow: "0px 0px 0px 2px rgba(25, 118, 210, 0.25)",
          },
          // Remove height here entirely to prevent forcing it on multiline
        },
        input: {
          padding: "0 12px", // Adds padding to the left and right of the text
          fontSize: 14,
          height: "40px", // Height for single-line input fields only
          "&.MuiInputBase-inputMultiline": {
            height: "unset", // Exclude multiline inputs (textareas) from fixed height
          },
          fontWeight: 500,
          lineHeight: 1.6,
        },
      },
    },
    MuiFormLabel: {
      styleOverrides: {
        root: {
          fontSize: 14,
          fontWeight: 500,
        },
      },
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
          // Remove height settings from root, handled in input styles
          "& .MuiInputBase-inputMultiline": {
            height: "unset", // Exclude textareas from fixed height settings
          },
        },
      },
    },
  };
};
