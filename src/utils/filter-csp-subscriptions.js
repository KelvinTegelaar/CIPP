// Narrows a CSP provider's subscription options to the Microsoft licences being purchased.
// Providers may tag each item with microsoftSkuId (the Graph skuId). Untagged items are kept,
// since a provider that does not supply the field cannot be matched and must still be selectable.
const normalise = (id) => String(id ?? "").trim().toLowerCase();

export const filterCspSubscriptionsByLicence = (options = [], licenceSkuIds = []) => {
  const wanted = new Set(licenceSkuIds.map(normalise).filter(Boolean));
  if (wanted.size === 0) return options;
  return options.filter((option) => {
    const tagged = normalise(option?.rawData?.microsoftSkuId);
    return !tagged || wanted.has(tagged);
  });
};

// The single option tagged for one of the licences, or undefined when there is no unambiguous match.
export const getSingleCspLicenceMatch = (options = [], licenceSkuIds = []) => {
  const wanted = new Set(licenceSkuIds.map(normalise).filter(Boolean));
  const matches = options.filter((option) => wanted.has(normalise(option?.rawData?.microsoftSkuId)));
  return matches.length === 1 ? matches[0] : undefined;
};
