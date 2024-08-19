import { alpha } from "@mui/material/styles";

const withAlphas = (color) => {
  return {
    ...color,
    alpha4: alpha(color.main, 0.04),
    alpha8: alpha(color.main, 0.08),
    alpha12: alpha(color.main, 0.12),
    alpha30: alpha(color.main, 0.3),
    alpha50: alpha(color.main, 0.5),
  };
};

export const neutral = {
  50: "#F9FAFB",
  100: "#F2F4F7",
  200: "#EAECF0",
  300: "#D0D5DD",
  400: "#98A2B3",
  500: "#667085",
  600: "#475467",
  700: "#344054",
  800: "#1D2939",
  900: "#101828",
};

export const blue = withAlphas({
  light: "#003049",
  main: "#003049",
  dark: "#003049",
  contrastText: "#FFFFFF",
});

export const orange = withAlphas({
  light: "#F77F00",
  main: "#F77F00",
  dark: "#F77F00",
  contrastText: "#FFFFFF",
});

export const indigo = withAlphas({
  light: "#EBEEFE",
  main: "#635dff",
  dark: "#4338CA",
  contrastText: "#FFFFFF",
});

export const purple = withAlphas({
  light: "#F4EBFF",
  main: "#9E77ED",
  dark: "#6941C6",
  contrastText: "#FFFFFF",
});

export const success = withAlphas({
  light: "#3FC79A",
  main: "#10B981",
  dark: "#0B815A",
  contrastText: "#FFFFFF",
});

export const info = withAlphas({
  light: "#CFF9FE",
  main: "#06AED4",
  dark: "#0E7090",
  contrastText: "#FFFFFF",
});

export const warning = withAlphas({
  light: "#FEF0C7",
  main: "#F79009",
  dark: "#B54708",
  contrastText: "#FFFFFF",
});

export const error = withAlphas({
  light: "#FEE4E2",
  main: "#F04438",
  dark: "#B42318",
  contrastText: "#FFFFFF",
});
