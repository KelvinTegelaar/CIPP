import { Chip } from "@mui/material";
import ReactTimeAgo from "react-time-ago";
import { parseCippDate } from "../../utils/parse-cipp-date";

export const CippTimeAgo = ({ data, type = "text", timeStyle = "round-minute" }) => {
  const isText = type === "text";
  const date = parseCippDate(data);

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
