import M365Licenses from "../data/M365Licenses.json";

export const getCippLicenseTranslation = (licenseArray) => {
  let licenses = [];

  if (!Array.isArray(licenseArray) && typeof licenseArray === "object") {
    licenseArray = [licenseArray];
  }

  if (!licenseArray || licenseArray.length === 0) {
    return ["No Licenses Assigned"];
  }

  licenseArray?.forEach((licenseAssignment) => {
    let found = false;
    for (let x = 0; x < M365Licenses.length; x++) {
      if (licenseAssignment.skuId === M365Licenses[x].GUID) {
        licenses.push(
          M365Licenses[x].Product_Display_Name
            ? M365Licenses[x].Product_Display_Name
            : licenseAssignment.skuPartNumber
        );
        found = true;
        break;
      }
    }
    if (!found) {
      licenses.push(licenseAssignment.skuPartNumber);
    }
  });

  if (!licenses || licenses.length === 0) {
    return ["No Licenses Assigned"];
  }
  return licenses;
};
