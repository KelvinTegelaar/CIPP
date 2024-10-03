import M365Licenses from "../data/M365Licenses.json";

export const getCippLicenseTranslation = (licenseArray) => {
  console.log(licenseArray);
  let licenses = [];
  licenseArray?.map((licenseAssignment, idx) => {
    for (var x = 0; x < M365Licenses.length; x++) {
      if (licenseAssignment.skuId == M365Licenses[x].GUID) {
        licenses.push(M365Licenses[x].Product_Display_Name);
        break;
      }
    }
  });
  return licenses.join(", ");
};
