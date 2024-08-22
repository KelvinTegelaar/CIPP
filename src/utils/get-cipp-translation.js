import { CippTranslations } from "../components/CippComponents/CippTranslations";

export const getCippTranslation = (field) => {
  return (
    CippTranslations[field] ||
    field.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())
  );
};
