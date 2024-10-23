import { createTheme as createMuiTheme, responsiveFontSizes } from "@mui/material/styles";
import { createOptions as createBaseOptions } from "./base/create-options";
import { createOptions as createDarkOptions } from "./dark/create-options";
import { createOptions as createLightOptions } from "./light/create-options";

export const createTheme = (config) => {
  let theme = createMuiTheme(
    // Base options available for both dark and light palette modes
    createBaseOptions({
      direction: config.direction,
    }),
    // Options based on selected palette mode, color preset and contrast
    config.paletteMode === "dark"
      ? createDarkOptions({
          colorPreset: config.colorPreset,
          contrast: config.contrast,
        })
      : createLightOptions({
          colorPreset: config.colorPreset,
          contrast: config.contrast,
        }),
    {
      components: {
        MuiCssBaseline: {
          styleOverrides: {
            body: {
              "--sb-track-color": "#232E33",
              "--sb-thumb-color": "#6BAF8D",
              "--sb-size": "7px",

              "&::-webkit-scrollbar": {
                width: "var(--sb-size)",
              },
              "&::-webkit-scrollbar-track": {
                backgroundColor: "var(--sb-track-color)",
                borderRadius: "4px",
              },
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: "var(--sb-thumb-color)",
                borderRadius: "4px",
              },
              "&::-webkit-scrollbar:horizontal": {
                height: "var(--sb-size)", // Set height for the horizontal scrollbar
              },
              "@supports not selector(::-webkit-scrollbar)": {
                scrollbarColor: "var(--sb-thumb-color) var(--sb-track-color)",
              },
            },
            // Targeting MaterialReactTable scrollable container
            ".MuiTableContainer-root": {
              "--sb-track-color": "#232E33",
              "--sb-thumb-color": "#6BAF8D",
              "--sb-size": "7px",

              "&::-webkit-scrollbar": {
                width: "var(--sb-size)",
              },
              "&::-webkit-scrollbar-track": {
                backgroundColor: "var(--sb-track-color)",
                borderRadius: "4px",
              },
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: "var(--sb-thumb-color)",
                borderRadius: "4px",
              },
              "&::-webkit-scrollbar:horizontal": {
                height: "var(--sb-size)", // Custom height for the horizontal scrollbar in the table
              },
              "@supports not selector(::-webkit-scrollbar)": {
                scrollbarColor: "var(--sb-thumb-color) var(--sb-track-color)",
              },
            },
          },
        },
      },
    }
  );

  if (config.responsiveFontSizes) {
    theme = responsiveFontSizes(theme);
  }

  return theme;
};
