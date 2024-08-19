import { SvgIcon } from "@mui/material";
import { paths } from "../paths";
import GraphIcon from "../icons/iconly/bulk/graph";
import SettingsIcon from "../icons/iconly/bulk/settings";
import { UserIcon } from "@heroicons/react/24/outline";
import { Domain } from "@mui/icons-material";

export const items = [
  {
    title: "Overview",
    path: paths.index,
    icon: (
      <SvgIcon>
        <GraphIcon />
      </SvgIcon>
    ),
  },
  {
    title: "Users",
    path: paths.users,
    icon: (
      <SvgIcon>
        <UserIcon />
      </SvgIcon>
    ),
  },
  {
    title: "Domains",
    path: paths.domains,
    icon: (
      <SvgIcon>
        <Domain />
      </SvgIcon>
    ),
  },
  {
    title: "Onboarding",
    path: paths.onboarding,
    icon: (
      <SvgIcon>
        <SettingsIcon />
      </SvgIcon>
    ),
  },
];
