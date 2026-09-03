import { IconButton, Tooltip } from "@mui/material";
import { CippIcons } from "../../utils/icon-registry";

/**
 * Small info icon that shows a tooltip on hover.
 *
 * @param {string} title - Tooltip content
 * @param {string} [placement="top"] - MUI Tooltip placement
 * @param {number} [fontSize=16] - Icon size in px
 */
const CippInfoTooltip = ({ title, placement = "top", fontSize = 16 }) => (
  <Tooltip title={title} placement={placement} arrow>
    <IconButton size="small" sx={{ p: 0.25 }} aria-label="More information">
      <CippIcons.InfoOutlined sx={{ fontSize }} />
    </IconButton>
  </Tooltip>
);

export default CippInfoTooltip;
