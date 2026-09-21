import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../test-utils";
import { WizardSteps } from "../../../src/components/CippWizard/wizard-steps";

// jsdom has no width-based matchMedia, so the mobile branch is driven by mocking the hook
const layoutState = vi.hoisted(() => ({ isMobile: false }));
vi.mock("../../../src/hooks/use-breakpoint", () => ({
  useIsMobileLayout: () => layoutState.isMobile,
  useIsTabletLayout: () => false,
  useTableViewMode: () => "table",
}));

const steps = [
  { title: "tenant", description: "Tenant Selection" },
  { title: "user", description: "User Selection" },
  { title: "actions", description: "Vacation Actions" },
  { title: "schedule", description: "Schedule" },
  { title: "review", description: "Review & Submit" },
];

beforeEach(() => {
  layoutState.isMobile = false;
});

describe("WizardSteps", () => {
  it("keeps the full stepper on desktop", () => {
    renderWithProviders(<WizardSteps orientation="horizontal" activeStep={2} steps={steps} />);

    expect(screen.getByText("Tenant Selection")).toBeInTheDocument();
    expect(screen.getByText("Review & Submit")).toBeInTheDocument();
    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
  });

  it("collapses to a progress header on a phone", () => {
    layoutState.isMobile = true;
    renderWithProviders(<WizardSteps orientation="horizontal" activeStep={2} steps={steps} />);

    expect(screen.getByText("Step 3 of 5")).toBeInTheDocument();
    expect(screen.getByText("Vacation Actions")).toBeInTheDocument();
    // the other four steps are not competing for the same 326px
    expect(screen.queryByText("Tenant Selection")).not.toBeInTheDocument();
    expect(screen.queryByText("Review & Submit")).not.toBeInTheDocument();

    const bar = screen.getByRole("progressbar");
    expect(bar).toHaveAttribute("aria-valuenow", "60");
  });

  // The vertical variant is not wizard navigation: GDAP onboarding feeds it server-side
  // steps where each step's message and pass/fail state IS the content.
  it("leaves the vertical status list alone on a phone", () => {
    layoutState.isMobile = true;
    const onboarding = [
      { title: "invite", description: "Invite accepted", error: false },
      { title: "roles", description: "Role assignment failed: insufficient privileges", error: true },
    ];
    renderWithProviders(<WizardSteps orientation="vertical" activeStep={1} steps={onboarding} />);

    expect(screen.getByText("Invite accepted")).toBeInTheDocument();
    expect(
      screen.getByText("Role assignment failed: insufficient privileges")
    ).toBeInTheDocument();
    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
  });

  it("carries the current step's error and loading states into the bar", () => {
    layoutState.isMobile = true;
    const failing = [{ description: "Deploying" }, { description: "Failed", error: true }];
    const { unmount } = renderWithProviders(
      <WizardSteps orientation="horizontal" activeStep={1} steps={failing} />
    );
    expect(screen.getByRole("progressbar").className).toMatch(/colorError/);
    unmount();

    const running = [{ description: "Deploying", loading: true }];
    renderWithProviders(<WizardSteps orientation="horizontal" activeStep={0} steps={running} />);
    expect(screen.getByRole("progressbar").className).toMatch(/indeterminate/);
  });

  it("survives an activeStep past the end of the visible steps", () => {
    layoutState.isMobile = true;
    // handleNext counts against the unfiltered step list, so this really happens on wizards
    // whose steps are conditionally hidden.
    renderWithProviders(
      <WizardSteps orientation="horizontal" activeStep={7} steps={steps.slice(0, 3)} />
    );

    expect(screen.getByText("Step 3 of 3")).toBeInTheDocument();
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "100");
  });

  it("renders nothing broken for an empty step list", () => {
    layoutState.isMobile = true;
    renderWithProviders(<WizardSteps orientation="horizontal" activeStep={0} steps={[]} />);

    expect(screen.getByText("No steps")).toBeInTheDocument();
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "0");
  });
});
