import { blue, orange, indigo, purple } from "./colors";

export const getPrimary = (preset) => {
  switch (preset) {
    case "blue":
      return blue;
    case "orange":
      return orange;
    case "indigo":
      return indigo;
    case "purple":
      return purple;
    default:
      console.error(
        'Invalid color preset, accepted values: "blue", "orange", "indigo" or "purple"".'
      );
      return indigo;
  }
};
