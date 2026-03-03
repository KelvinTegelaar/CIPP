import { Chip } from "@mui/material";
import ReactTimeAgo from "react-time-ago";

export const CippTimeAgo = ({ data, type = "text", timeStyle = "round-minute" }) => {
  const isText = type === "text";
  const numberRegex = /^\d+$/;
  const date =
    typeof data === "number" || numberRegex.test(data) ? new Date(data * 1000) : new Date(data);

  if (date.getTime() === 0) {
    return "Never";
  }
  if (isNaN(date.getTime())) {
    return isText ? (
      "No Data"
    ) : (
      <Chip variant="outlined" label="No Data" size="small" color="info" />
    );
  }
  return <ReactTimeAgo date={date} timeStyle={timeStyle} />;
};
