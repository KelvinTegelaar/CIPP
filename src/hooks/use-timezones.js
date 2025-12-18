import { useState, useEffect } from "react";
import { getTimeZones } from "@vvo/tzdb";

export const useTimezones = () => {
  const [timezones, setTimezones] = useState([{ label: "UTC", value: "UTC" }]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      setLoading(true);
      const tzData = getTimeZones({ includeUtc: true });

      if (!Array.isArray(tzData)) {
        throw new Error("getTimeZones did not return an array");
      }

      const formattedTimezones = tzData
        .filter((tz) => typeof tz?.name === "string" && tz.name.length > 0)
        .map((tz) => {
          const name = String(tz.name);
          const current = tz?.currentTimeFormat ? String(tz.currentTimeFormat) : undefined;
          const label = current ? `${name} (${current})` : name;
          return {
            label,
            value: name,
            alternativeName: tz?.alternativeName ? String(tz.alternativeName) : undefined,
          };
        })
        // de-duplicate by value
        .filter((item, idx, arr) => arr.findIndex((t) => t.value === item.value) === idx)
        // sort by label for consistent UX
        .sort((a, b) => a.label.localeCompare(b.label));

      // Always ensure a non-empty array; prepend UTC as a safe default
      const withFallback = formattedTimezones.length
        ? formattedTimezones
        : [{ label: "UTC", value: "UTC" }];
      setTimezones(withFallback);
      setError(null);
    } catch (err) {
      console.error("Error loading timezones:", err);
      setError(err.message);
      // Fallback to UTC (already seeded), keep as-is
      setTimezones((prev) => (prev?.length ? prev : [{ label: "UTC", value: "UTC" }]));
    } finally {
      setLoading(false);
    }
  }, []);
  console.log("Timezones loaded:", timezones);
  return { timezones, loading, error };
};
