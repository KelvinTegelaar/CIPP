import { Box, LinearProgress } from "@mui/material";

export const LinearProgressWithLabel = (props) => {
  const { value, colourLevels, addedLabel, ...otherProps } = props;

  // Function to determine color based on value and colourLevels
  const getProgressColor = (value, colourLevels) => {
    if (!colourLevels) {
      return undefined; // Use default MUI color
    }

    // Check if flipped mode is enabled
    const isFlipped = colourLevels === 'flipped' || colourLevels.flipped === true;

    if (isFlipped) {
      // Flipped color order: green -> yellow -> orange -> red
      if (value >= 0 && value < 25) {
        return "#4caf50"; // Green for low values when flipped
      } else if (value >= 25 && value < 50) {
        return "#ffeb3b"; // Yellow
      } else if (value >= 50 && value < 75) {
        return "#ff9800"; // Orange
      } else if (value >= 75 && value <= 100) {
        return "#f44336"; // Red for high values when flipped
      }
    } else {
      // Normal color order: red -> orange -> yellow -> green
      if (value >= 0 && value < 25) {
        return colourLevels.level0to25 || "#f44336"; // Default red
      } else if (value >= 25 && value < 50) {
        return colourLevels.level25to50 || "#ff9800"; // Default orange
      } else if (value >= 50 && value < 75) {
        return colourLevels.level50to75 || "#ffeb3b"; // Default yellow
      } else if (value >= 75 && value <= 100) {
        return colourLevels.level75to100 || "#4caf50"; // Default green
      }
    }

    return undefined; // Fallback to default
  };

  const progressColor = getProgressColor(value, colourLevels);

  return (
    <Box sx={{ display: "flex", alignItems: "center" }}>
      <Box sx={{ width: "100%", mr: 1 }}>
        <LinearProgress
          variant="determinate"
          value={value}
          sx={
            progressColor
              ? {
                  "& .MuiLinearProgress-bar": {
                    backgroundColor: progressColor,
                  },
                }
              : {}
          }
          {...otherProps}
        />
      </Box>
      <Box sx={{ minWidth: 135 }}>{`${Math.round(value)}% ${addedLabel ?? ""}`}</Box>
    </Box>
  );
};
