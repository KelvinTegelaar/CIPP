import React from "react";
import { describe, it, expect, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button, Drawer, ListItemButton, MenuItem, Stack, Typography } from "@mui/material";
import { CippPageActionsFab } from "../../../src/components/CippComponents/CippPageActionsFab";
import { renderWithProviders } from "../../test-utils";

const openSheet = async (user, label = "Page actions") => {
  await user.click(screen.getByRole("button", { name: label }));
  await screen.findByText("Sheet content");
};

describe("CippPageActionsFab", () => {
  it("renders the FAB and opens the sheet with its children", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <CippPageActionsFab>
        <Typography>Sheet content</Typography>
        <Button>Do a thing</Button>
      </CippPageActionsFab>
    );

    // keepMounted: the children stay mounted so a child-owned overlay survives the
    // sheet closing, so "closed" means hidden rather than absent.
    expect(screen.getByText("Sheet content")).not.toBeVisible();
    await openSheet(user);

    expect(screen.getByText("Sheet content")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Do a thing" })).toBeInTheDocument();
    expect(screen.getByText("Actions")).toBeInTheDocument();
  });

  // A cardButton laid out for a desktop CardHeader is as often a Stack as a Box. Matching
  // only Box left the row intact while every button was stretched to 100%, so three import
  // buttons ran off the side of the sheet.
  it("restacks a row of buttons that arrived as a Stack", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <CippPageActionsFab>
        <Stack direction="row" spacing={1}>
          <Button>Sheet content</Button>
          <Button>Import from CSV</Button>
          <Button>Manual Import</Button>
        </Stack>
      </CippPageActionsFab>
    );
    await openSheet(user);

    const row = screen.getByText("Manual Import").closest(".MuiStack-root");
    const styles = window.getComputedStyle(row);
    expect(styles.flexDirection).toBe("column");
    // Stack's spacing is a margin-left that would survive the flip and indent each row
    const button = screen.getByText("Manual Import").closest("button");
    expect(window.getComputedStyle(button).marginLeft).toBe("0px");
  });

  // The sheet's paper is grey; a text button's default primary accent reads as
  // orange-on-grey and doesn't match the list rows underneath it.
  it("neutralises text buttons without flattening the branded ones", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <>
        <Button>Untouched</Button>
        <CippPageActionsFab>
          <Stack direction="row" spacing={1}>
            <Button>Sheet content</Button>
            <Button variant="contained">Add User</Button>
          </Stack>
        </CippPageActionsFab>
      </>
    );
    await openSheet(user);

    // Compared against the same button outside the sheet, so the assertion fails if the
    // override goes away rather than merely describing MUI's defaults.
    const inSheet = screen.getByText("Sheet content").closest("button");
    const outside = screen.getByText("Untouched").closest("button");
    expect(window.getComputedStyle(inSheet).color).not.toBe(
      window.getComputedStyle(outside).color
    );
    // a deliberate call to action keeps its branding
    expect(screen.getByText("Add User").closest("button").className).toMatch(/MuiButton-colorPrimary/);
  });

  it("uses custom title and aria-label", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <CippPageActionsFab title="Dashboard actions" ariaLabel="Dashboard shortcuts">
        <Typography>Sheet content</Typography>
      </CippPageActionsFab>
    );

    await openSheet(user, "Dashboard shortcuts");
    expect(screen.getByText("Dashboard actions")).toBeInTheDocument();
  });

  it("closes the sheet when a child button is tapped", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    renderWithProviders(
      <CippPageActionsFab>
        <Typography>Sheet content</Typography>
        <Button onClick={onClick}>Do a thing</Button>
      </CippPageActionsFab>
    );

    await openSheet(user);
    await user.click(screen.getByRole("button", { name: "Do a thing" }));

    expect(onClick).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(screen.getByText("Sheet content")).not.toBeVisible());
  });

  it("closes the sheet when a child link is tapped", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <CippPageActionsFab restackButtons={false}>
        <Typography>Sheet content</Typography>
        <ListItemButton component="a" href="https://example.test" target="_blank">
          External portal
        </ListItemButton>
      </CippPageActionsFab>
    );

    await openSheet(user);
    await user.click(screen.getByRole("link", { name: "External portal" }));

    await waitFor(() => expect(screen.getByText("Sheet content")).not.toBeVisible());
  });

  it("closes the sheet when a MenuItem child is tapped", async () => {
    // ExecutiveReportButton renders variant="menuItem" — a <li role="menuitem">, not a button
    const user = userEvent.setup();
    const onClick = vi.fn();
    renderWithProviders(
      <CippPageActionsFab restackButtons={false}>
        <Typography>Sheet content</Typography>
        <MenuItem onClick={onClick}>Executive Summary</MenuItem>
      </CippPageActionsFab>
    );

    await openSheet(user);
    await user.click(screen.getByRole("menuitem", { name: "Executive Summary" }));

    expect(onClick).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(screen.getByText("Sheet content")).not.toBeVisible());
  });

  it("keeps the sheet open when non-interactive content is tapped", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <CippPageActionsFab>
        <Typography>Sheet content</Typography>
      </CippPageActionsFab>
    );

    await openSheet(user);
    await user.click(screen.getByText("Sheet content"));

    expect(screen.getByText("Sheet content")).toBeInTheDocument();
  });
});

// A cardButton child renders both its trigger and its own overlay (CippAddUserDrawer is a
// button plus a CippOffCanvas). If the sheet unmounts its children on close, that overlay
// disappears the instant it opens.
describe("CippPageActionsFab with a child that owns an overlay", () => {
  const DrawerAction = () => {
    const [open, setOpen] = React.useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Add User</Button>
        <Drawer anchor="right" open={open} onClose={() => setOpen(false)}>
          <div>Add user form</div>
        </Drawer>
      </>
    );
  };

  it("keeps the child's overlay open after the sheet closes", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <CippPageActionsFab>
        <DrawerAction />
      </CippPageActionsFab>
    );

    await user.click(screen.getByRole("button", { name: "Page actions" }));
    await user.click(await screen.findByRole("button", { name: "Add User" }));

    // the tap closes the sheet and opens the child's drawer — the drawer must survive it
    expect(await screen.findByText("Add user form")).toBeInTheDocument();
    await new Promise((resolve) => setTimeout(resolve, 500));
    expect(screen.getByText("Add user form")).toBeInTheDocument();
  });
});
