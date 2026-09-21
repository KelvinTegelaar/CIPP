import { describe, it, expect } from "vitest";
import { createTheme } from "../../src/theme";

// iOS Safari zooms the viewport when a focused input renders text below 16px, and it does
// not zoom back out afterwards. Every MUI input must reach 16px on coarse pointers.
const COARSE = "@media (pointer: coarse)";

describe("input font size on touch devices", () => {
  const theme = createTheme({ colorPreset: "orange", contrast: "high", paletteMode: "light" });

  it.each(["MuiInputBase", "MuiFilledInput"])("%s inputs reach 16px on coarse pointers", (key) => {
    const input = theme.components[key].styleOverrides.input;
    expect(input.fontSize).toBeLessThan(16); // pointer devices stay compact
    expect(input[COARSE]?.fontSize).toBe(16);
  });
});
