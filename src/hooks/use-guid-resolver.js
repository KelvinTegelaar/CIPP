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

// Function to extract object IDs from partner tenant UPNs (user_<objectid>@<tenant>.onmicrosoft.com)
// Also handles format: TenantName.onmicrosoft.com\tenant: <tenant-guid>, object: <object-guid>
const extractObjectIdFromPartnerUPN = (str) => {
  if (typeof str !== "string") return [];
  const matches = [];

  // Format 1: user_<objectid>@<tenant>.onmicrosoft.com
  const partnerUpnRegex = /user_([0-9a-f]{32})@([^@]+\.onmicrosoft\.com)/gi;
  let match;

  while ((match = partnerUpnRegex.exec(str)) !== null) {
    // Convert the 32-character hex string to GUID format
    const hexId = match[1];
    const tenantDomain = match[2];
    if (hexId.length === 32) {
      const guid = [
        hexId.slice(0, 8),
        hexId.slice(8, 12),
        hexId.slice(12, 16),
        hexId.slice(16, 20),
        hexId.slice(20, 32),
      ].join("-");
      matches.push({ guid, tenantDomain });
    }
  }

  // Format 2: TenantName.onmicrosoft.com\tenant: <tenant-guid>, object: <object-guid>
  // For exchange format, use the partner tenant guid for resolution
  const partnerTenantObjectRegex =
    /([^\\]+\.onmicrosoft\.com)\\tenant:\s*([0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}),\s*object:\s*([0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})/gi;

  while ((match = partnerTenantObjectRegex.exec(str)) !== null) {
    const customerTenantDomain = match[1]; // This is the customer tenant domain
    const partnerTenantGuid = match[2]; // This is the partner tenant guid - use this for resolution
    const objectGuid = match[3]; // This is the object to resolve

    // Use the partner tenant GUID for resolution
    matches.push({ guid: objectGuid, tenantDomain: partnerTenantGuid });
  }

  return matches;
};

// Function to recursively scan an object for GUIDs
const findGuids = (obj, guidsSet = new Set(), partnerGuidsMap = new Map()) => {
  if (!obj) return { guidsSet, partnerGuidsMap };

  if (typeof obj === "string") {
    // Check if the entire string is a GUID
    if (isGuid(obj)) {
      guidsSet.add(obj);
    } else {
      // Extract GUIDs embedded within longer strings
      const embeddedGuids = extractGuidsFromString(obj);
      embeddedGuids.forEach((guid) => guidsSet.add(guid));

      // Extract object IDs from partner tenant UPNs
      const partnerObjectIds = extractObjectIdFromPartnerUPN(obj);
      partnerObjectIds.forEach(({ guid, tenantDomain }) => {
        if (!partnerGuidsMap.has(tenantDomain)) {
          partnerGuidsMap.set(tenantDomain, new Set());
        }
        partnerGuidsMap.get(tenantDomain).add(guid);
      });
    }
  } else if (Array.isArray(obj)) {
    obj.forEach((item) => {
      const result = findGuids(item, guidsSet, partnerGuidsMap);
      guidsSet = result.guidsSet;
      partnerGuidsMap = result.partnerGuidsMap;
    });
  } else if (typeof obj === "object") {
    Object.values(obj).forEach((value) => {
      const result = findGuids(value, guidsSet, partnerGuidsMap);
      guidsSet = result.guidsSet;
      partnerGuidsMap = result.partnerGuidsMap;
    });
  }

  return { guidsSet, partnerGuidsMap };
};

export const useGuidResolver = (manualTenant = null) => {
  const tenantFilter = useSettings().currentTenant;
  const activeTenant = manualTenant || tenantFilter;

  // GUID resolution state
  const [guidMapping, setGuidMapping] = useState({});
  const [isLoadingGuids, setIsLoadingGuids] = useState(false);

  // Use refs for values that shouldn't trigger re-renders but need to persist
  const notFoundGuidsRef = useRef(new Set());
  const pendingGuidsRef = useRef([]);
  const pendingPartnerGuidsRef = useRef(new Map()); // Map of tenantDomain -> Set of GUIDs
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

  // Setup API call for partner tenant directory objects resolution
  const partnerDirectoryObjectsMutation = ApiPostCall({
    relatedQueryKeys: ["partnerDirectoryObjects"],
    onResult: (data) => {
      if (data && Array.isArray(data.value)) {
        const newMapping = {};

        // Process the returned results
        data.value.forEach((item) => {
          if (item.id && (item.displayName || item.userPrincipalName || item.mail)) {
            newMapping[item.id] = item.displayName || item.userPrincipalName || item.mail;
          }
        });

        setGuidMapping((prevMapping) => ({ ...prevMapping, ...newMapping }));

        // Clear processed partner GUIDs
        pendingPartnerGuidsRef.current = new Map();
        setIsLoadingGuids(false);
      }
    },
  });

  // Function to handle resolving GUIDs
  const resolveGuids = useCallback(
    (objectToScan) => {
      const { guidsSet, partnerGuidsMap } = findGuids(objectToScan);

      // Handle regular GUIDs (current tenant)
      if (guidsSet.size > 0) {
        const guidsArray = Array.from(guidsSet);
        const notResolvedGuids = guidsArray.filter(
          (guid) => !guidMapping[guid] && !notFoundGuidsRef.current.has(guid)
        );

        if (notResolvedGuids.length > 0) {
          const allPendingGuids = [...new Set([...pendingGuidsRef.current, ...notResolvedGuids])];
          pendingGuidsRef.current = allPendingGuids;
          setIsLoadingGuids(true);

          // Implement throttling - only send a new request every 2 seconds
          const now = Date.now();
          if (now - lastRequestTimeRef.current >= 2000) {
            lastRequestTimeRef.current = now;

            // Only send a maximum of 1000 GUIDs per request
            const batchSize = 1000;
            const guidsToSend = allPendingGuids.slice(0, batchSize);

            if (guidsToSend.length > 0) {
              directoryObjectsMutation.mutate({
                url: "/api/ListDirectoryObjects",
                data: {
                  tenantFilter: activeTenant,
                  ids: guidsToSend,
                  $select: "id,displayName,userPrincipalName,mail",
                },
              });
            } else {
              setIsLoadingGuids(false);
            }
          }
        }
      }

      // Handle partner tenant GUIDs
      if (partnerGuidsMap.size > 0) {
        partnerGuidsMap.forEach((guids, tenantDomain) => {
          const guidsArray = Array.from(guids);
          const notResolvedGuids = guidsArray.filter(
            (guid) => !guidMapping[guid] && !notFoundGuidsRef.current.has(guid)
          );

          if (notResolvedGuids.length > 0) {
            // Store pending partner GUIDs
            if (!pendingPartnerGuidsRef.current.has(tenantDomain)) {
              pendingPartnerGuidsRef.current.set(tenantDomain, new Set());
            }
            notResolvedGuids.forEach((guid) =>
              pendingPartnerGuidsRef.current.get(tenantDomain).add(guid)
            );

            setIsLoadingGuids(true);

            // Make API call for partner tenant
            const batchSize = 1000;
            const guidsToSend = notResolvedGuids.slice(0, batchSize);

            if (guidsToSend.length > 0) {
              partnerDirectoryObjectsMutation.mutate({
                url: "/api/ListDirectoryObjects",
                data: {
                  tenantFilter: tenantDomain,
                  ids: guidsToSend,
                  $select: "id,displayName,userPrincipalName,mail",
                },
              });
            }
          }
        });
      }

      // If no GUIDs to process, ensure loading state is false
      if (guidsSet.size === 0 && partnerGuidsMap.size === 0) {
        setIsLoadingGuids(false);
      }
    },
    [guidMapping, activeTenant] // Only depend on guidMapping and activeTenant
  );

  return {
    guidMapping,
    isLoadingGuids,
    resolveGuids,
    isGuid,
    extractObjectIdFromPartnerUPN,
  };
};
