import React from "react";
import { describe, it, expect, vi } from "vitest";
import { renderWithProviders, settingsWith } from "../../test-utils";
import { createTheme } from "../../../src/theme";

// jsdom gives nivo's responsive wrapper a 0×0 parent, so nothing paints — capture the
// props instead and assert on the dark/light decisions they encode.
const captured = vi.hoisted(() => ({ props: null }));
vi.mock("@nivo/sankey", () => ({
  ResponsiveSankey: (props) => {
    captured.props = props;
    return null;
  },
}));

vi.mock("../../../src/hooks/use-breakpoint", async (importOriginal) => ({
  ...(await importOriginal()),
  useIsMobileLayout: () => false,
}));

import { CippSankey } from "../../../src/components/CippComponents/CippSankey";

const data = {
  nodes: [
    { id: "Users", nodeColor: "#f97316" },
    { id: "MFA", nodeColor: "#22c55e" },
  ],
  links: [{ source: "Users", target: "MFA", value: 5 }],
};

const darkTheme = createTheme({
  colorPreset: "orange",
  direction: "ltr",
  paletteMode: "dark",
  contrast: "high",
});

describe("CippSankey theming", () => {
  // The app resolves currentTheme "browser" to the OS preference when building the MUI
  // theme, so the *setting* can say "browser" while the page paints dark. Deciding
  // darkness from the setting made the chart multiply its ribbons over a dark card —
  // composited to black, i.e. an invisible chart until the user toggled the theme.
  it("follows the painted palette, not the theme setting", () => {
    renderWithProviders(<CippSankey data={data} />, {
      theme: darkTheme,
      settings: settingsWith({ currentTheme: { value: "browser", label: "Browser default" } }),
    });

    expect(captured.props.linkBlendMode).toBe("lighten");
    expect(captured.props.labelTextColor).toBe("#ffffff");
  });

  it("keeps multiply-over-white on an actually light page", () => {
    renderWithProviders(<CippSankey data={data} />, {
      settings: settingsWith({ currentTheme: { value: "browser", label: "Browser default" } }),
    });

    expect(captured.props.linkBlendMode).toBe("multiply");
    expect(captured.props.labelTextColor).toBe("#000000");
  });
});
