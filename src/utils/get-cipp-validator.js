export const getCippValidator = (value, type) => {
  switch (type) {
    case "boolean":
      return typeof value === "boolean" || "This is not a valid boolean value";
    case "number":
      return !isNaN(value) || "This is not a valid number";
    case "json":
      try {
        JSON.parse(value);
        return true;
      } catch (e) {
        return "This is invalid JSON";
      }
    case "email":
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || "This is not a valid email";
    case "url":
      return /^(http|https):\/\/[^ "]+$/.test(value) || "This is not a valid URL";
    case "string":
      return typeof value === "string" || "This is not a valid string";
    default:
      return true;
  }
};
