import { describe, it, expect } from "vitest";
import { createTheme } from "../../src/theme";

// Card gutters are set once in the theme and paid at every nesting level: a card inside an
// accordion inside a page card spends most of a phone's width on chrome before any content
// gets a pixel. These have to stay narrower below md — and desktop has to keep its 24px.
const MOBILE = "@media (max-width: 899.95px)";

describe("horizontal gutters on small screens", () => {
  const theme = createTheme({ colorPreset: "orange", contrast: "high", paletteMode: "light" });
  const root = (key) => theme.components[key].styleOverrides.root;

  it.each(["MuiCardContent", "MuiCardHeader", "MuiCardActions"])(
    "%s trims its 24px gutters on a phone",
    (key) => {
      expect(root(key).paddingLeft).toBe(24);
      expect(root(key)[MOBILE]?.paddingLeft).toBe(16);
      expect(root(key)[MOBILE]?.paddingRight).toBe(16);
    }
  );

  it.each(["MuiAccordionSummary", "MuiAccordionDetails"])(
    "%s halves the padding it adds inside a card",
    (key) => {
      expect(root(key)[MOBILE]?.paddingLeft).toBe(8);
      expect(root(key)[MOBILE]?.paddingRight).toBe(8);
    }
  );

  // `:first-of-type` counts per element type, so an actions row of [caption div, button,
  // button] gave the first button no margin and the second 16px. Invisible in a row; once the
  // row stacks on a phone the two buttons sit at different left edges and different widths.
  it("spaces dialog actions with gap on a phone, not a margin the stack inherits", () => {
    const actions = root("MuiDialogActions");
    expect(actions["&>:not(:first-of-type)"].marginLeft).toBe(16);
    expect(actions[MOBILE]?.["&>:not(:first-of-type)"]?.marginLeft).toBe(0);
    expect(actions[MOBILE]?.gap).toBe(8);
    expect(actions[MOBILE]?.paddingLeft).toBe(16);
  });

  it("leaves vertical rhythm alone — width is what runs out, not height", () => {
    const content = root("MuiCardContent");
    expect(content.paddingTop).toBe(20);
    expect(content[MOBILE]?.paddingTop).toBeUndefined();
    expect(content[MOBILE]?.paddingBottom).toBeUndefined();
  });
});
