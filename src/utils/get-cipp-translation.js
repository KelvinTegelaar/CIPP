import { CippTranslations } from "../components/CippComponents/CippTranslations";

export const getCippTranslation = (field) => {
  if (field === null || field === undefined) {
    return "No data";
  }

  return (
    CippTranslations[field] ||
    field
      .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/(^|\.)(\w)/g, (_, dot, char) => dot + char.toUpperCase())
      .replace(/[_]/g, " ")
      .replace(/\./g, " - ")
      .replace(/([a-z])([A-Z])/g, "$1 $2")
  );
};
