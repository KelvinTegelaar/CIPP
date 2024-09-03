import { CopyAll } from "@mui/icons-material";
import { Chip, IconButton, SvgIcon, Tooltip } from "@mui/material";
import CopyToClipboard from "react-copy-to-clipboard";

export const CippCopyToClipBoard = (props) => {
  const { text, type = "button", ...other } = props;
  return (
    <>
      {type === "button" && (
        <CopyToClipboard text={props.text}>
          <Tooltip title="Copy to clipboard">
            <IconButton size="small">
              <SvgIcon>
                <CopyAll />
              </SvgIcon>
            </IconButton>
          </Tooltip>
        </CopyToClipboard>
      )}
      {type === "chip" && (
        <CopyToClipboard text={props.text}>
          <Tooltip title="Copy to clipboard">
            <Chip
              label={text}
              variant="outlined"
              size="small"
              color="info"
              sx={{ mr: "0.25rem" }}
            />
          </Tooltip>
        </CopyToClipboard>
      )}
    </>
  );
};
