import { describe, it, expect } from "vitest";
import {
  filterCspSubscriptionsByLicence,
  getSingleCspLicenceMatch,
} from "../../src/utils/filter-csp-subscriptions";

const premium = "cbdc14ab-d96c-4c30-b9f4-6ada7cdc1d46";
const standard = "f245ecc8-75af-4f8e-b61f-27d8114de5f3";
const option = (value, microsoftSkuId) => ({ value, rawData: { sku: value, microsoftSkuId } });

const options = [
  option("BP-ANNUAL", premium),
  option("BP-MONTHLY", premium.toUpperCase()),
  option("BS-ANNUAL", standard),
  option("UNTAGGED"),
];

describe("filterCspSubscriptionsByLicence", () => {
  it("keeps subscriptions for the selected licence and drops ones tagged for another", () => {
    const values = filterCspSubscriptionsByLicence(options, [premium]).map((o) => o.value);
    expect(values).toEqual(["BP-ANNUAL", "BP-MONTHLY", "UNTAGGED"]);
  });

  it("keeps untagged subscriptions so providers without the field still work", () => {
    const untagged = [option("A"), option("B")];
    expect(filterCspSubscriptionsByLicence(untagged, [premium])).toEqual(untagged);
  });

  it("returns everything when no licence is selected", () => {
    expect(filterCspSubscriptionsByLicence(options, [])).toEqual(options);
  });
});

describe("getSingleCspLicenceMatch", () => {
  it("returns the only subscription tagged for the licence", () => {
    expect(getSingleCspLicenceMatch(options, [standard])?.value).toBe("BS-ANNUAL");
  });

  it("returns nothing when several terms match, so the technician chooses", () => {
    expect(getSingleCspLicenceMatch(options, [premium])).toBeUndefined();
  });

  it("never picks an untagged subscription", () => {
    expect(getSingleCspLicenceMatch([option("UNTAGGED")], [premium])).toBeUndefined();
  });
});
