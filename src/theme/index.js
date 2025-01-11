import { createTheme as createMuiTheme, responsiveFontSizes } from "@mui/material/styles";
import { createOptions as createBaseOptions } from "./base/create-options";
import { createOptions as createDarkOptions } from "./dark/create-options";
import { createOptions as createLightOptions } from "./light/create-options";

export const createTheme = (config) => {
  let theme = createMuiTheme(
    createBaseOptions({
      direction: config.direction,
    }),
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
            // Set global custom scrollbar variables
            html: {
              "--sb-track-color": "#232E33",
              "--sb-thumb-color": "#6BAF8D",
              "--sb-size": "7px",
            },
            // Apply global scrollbar styles to every element
            "html, body, *": {
              "&::-webkit-scrollbar": {
                width: "var(--sb-size)",
                height: "var(--sb-size)",
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
                height: "var(--sb-size)",
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
