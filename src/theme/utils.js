import { blue, green, indigo, purple } from "./colors";

export const getPrimary = (preset) => {
  switch (preset) {
    case "blue":
      return blue;
    case "green":
      return green;
    case "indigo":
      return indigo;
    case "purple":
      return purple;
    default:
      console.error(
        'Invalid color preset, accepted values: "blue", "green", "indigo" or "purple"".'
      );
      return indigo;
  }
};
