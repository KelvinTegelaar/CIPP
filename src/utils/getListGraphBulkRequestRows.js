/**
 * Normalizes rows from /api/ListGraphBulkRequest after ApiPostCall.
 * The mutation returns the full axios response; the bulk row array shape varies by API wrapper.
 */
export function getListGraphBulkRequestRows(mutation) {
  const axiosResponse = mutation?.data;
  if (!axiosResponse) return [];
  const payload = axiosResponse.data;
  if (payload == null) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.data)) return payload.data;
  if (Array.isArray(payload.Data)) return payload.Data;
  if (Array.isArray(payload.Results)) return payload.Results;
  // A one-request batch comes back as the bare row rather than an array of rows.
  if (typeof payload === "object" && "id" in payload && "status" in payload) return [payload];
  return [];
}
