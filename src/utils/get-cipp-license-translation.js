import M365Licenses from "../data/M365Licenses.json";

export const getCippLicenseTranslation = (licenseArray) => {
  let licenses = [];
  licenseArray?.map((licenseAssignment) => {
    for (var x = 0; x < M365Licenses.length; x++) {
      if (licenseAssignment.skuId == M365Licenses[x].GUID) {
        licenses.push(
          M365Licenses[x].Product_Display_Name
            ? M365Licenses[x].Product_Display_Name
            : licenseAssignment.skuPartNumber
        );
        break;
      }
    }
  });
  return licenses.join(", ");
};
