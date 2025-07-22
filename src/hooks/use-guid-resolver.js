import { useState, useCallback, useRef } from "react";
import { ApiPostCall } from "/src/api/ApiCall";
import { useSettings } from "/src/hooks/use-settings";

// Function to check if a string is a GUID
const isGuid = (str) => {
  if (typeof str !== "string") return false;
  const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return guidRegex.test(str);
};

// Function to extract GUIDs from strings (including embedded GUIDs)
const extractGuidsFromString = (str) => {
  if (typeof str !== "string") return [];
  const guidRegex = /[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/gi;
  return str.match(guidRegex) || [];
};

// Function to recursively scan an object for GUIDs
const findGuids = (obj, guidsSet = new Set()) => {
  if (!obj) return guidsSet;

  if (typeof obj === "string") {
    // Check if the entire string is a GUID
    if (isGuid(obj)) {
      guidsSet.add(obj);
    } else {
      // Extract GUIDs embedded within longer strings
      const embeddedGuids = extractGuidsFromString(obj);
      embeddedGuids.forEach((guid) => guidsSet.add(guid));
    }
  } else if (Array.isArray(obj)) {
    obj.forEach((item) => findGuids(item, guidsSet));
  } else if (typeof obj === "object") {
    Object.values(obj).forEach((value) => findGuids(value, guidsSet));
  }

  return guidsSet;
};

export const useGuidResolver = () => {
  const tenantFilter = useSettings().currentTenant;

  // GUID resolution state
  const [guidMapping, setGuidMapping] = useState({});
  const [isLoadingGuids, setIsLoadingGuids] = useState(false);

  // Use refs for values that shouldn't trigger re-renders but need to persist
  const notFoundGuidsRef = useRef(new Set());
  const pendingGuidsRef = useRef([]);
  const lastRequestTimeRef = useRef(0);

  // Setup API call for directory objects resolution
  const directoryObjectsMutation = ApiPostCall({
    relatedQueryKeys: ["directoryObjects"],
    onResult: (data) => {
      if (data && Array.isArray(data.value)) {
        const newMapping = {};

        // Process the returned results
        data.value.forEach((item) => {
          if (item.id && (item.displayName || item.userPrincipalName || item.mail)) {
            newMapping[item.id] = item.displayName || item.userPrincipalName || item.mail;
          }
        });

        // Find GUIDs that were sent but not returned in the response
        const processedGuids = new Set(pendingGuidsRef.current);
        const returnedGuids = new Set(data.value.map((item) => item.id));
        const notReturned = [...processedGuids].filter((guid) => !returnedGuids.has(guid));

        // Add them to the notFoundGuids set
        if (notReturned.length > 0) {
          notReturned.forEach((guid) => notFoundGuidsRef.current.add(guid));
        }

        setGuidMapping((prevMapping) => ({ ...prevMapping, ...newMapping }));
        pendingGuidsRef.current = [];
        setIsLoadingGuids(false);
      }
    },
  });

  // Function to handle resolving GUIDs
  const resolveGuids = useCallback(
    (objectToScan) => {
      const guidsSet = findGuids(objectToScan);

      if (guidsSet.size === 0) return;

      const guidsArray = Array.from(guidsSet);
      const notResolvedGuids = guidsArray.filter(
        (guid) => !guidMapping[guid] && !notFoundGuidsRef.current.has(guid)
      );

      if (notResolvedGuids.length === 0) return;

      const allPendingGuids = [...new Set([...pendingGuidsRef.current, ...notResolvedGuids])];
      pendingGuidsRef.current = allPendingGuids;
      setIsLoadingGuids(true);

      // Implement throttling - only send a new request every 2 seconds
      const now = Date.now();
      if (now - lastRequestTimeRef.current < 2000) {
        return;
      }

      lastRequestTimeRef.current = now;

      // Only send a maximum of 1000 GUIDs per request
      const batchSize = 1000;
      const guidsToSend = allPendingGuids.slice(0, batchSize);

      if (guidsToSend.length > 0) {
        directoryObjectsMutation.mutate({
          url: "/api/ListDirectoryObjects",
          data: {
            tenantFilter: tenantFilter,
            ids: guidsToSend,
            $select: "id,displayName,userPrincipalName,mail",
          },
        });
      } else {
        setIsLoadingGuids(false);
      }
    },
    [guidMapping, tenantFilter] // Only depend on guidMapping and tenantFilter
  );

  return {
    guidMapping,
    isLoadingGuids,
    resolveGuids,
    isGuid,
  };
};
