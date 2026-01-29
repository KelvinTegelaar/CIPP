import { useState, useCallback, useRef, useEffect } from "react";
import { ApiPostCall } from "../api/ApiCall";
import { useSettings } from "./use-settings";

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
    // First, extract object IDs from partner tenant UPNs to track which GUIDs belong to partners
    const partnerObjectIds = extractObjectIdFromPartnerUPN(obj);
    const partnerGuids = new Set();

    partnerObjectIds.forEach(({ guid, tenantDomain }) => {
      if (!partnerGuidsMap.has(tenantDomain)) {
        partnerGuidsMap.set(tenantDomain, new Set());
      }
      partnerGuidsMap.get(tenantDomain).add(guid);
      partnerGuids.add(guid); // Track this GUID as belonging to a partner
    });

    // Check if the entire string is a GUID
    if (isGuid(obj)) {
      // Only add to main guidsSet if it's not a partner GUID
      if (!partnerGuids.has(obj)) {
        guidsSet.add(obj);
      }
    } else {
      // Extract GUIDs embedded within longer strings
      const embeddedGuids = extractGuidsFromString(obj);
      embeddedGuids.forEach((guid) => {
        // Only add to main guidsSet if it's not a partner GUID
        if (!partnerGuids.has(guid)) {
          guidsSet.add(guid);
        }
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

// Helper function to replace GUIDs and special UPNs in a string with resolved names
const replaceGuidsAndUpnsInString = (str, guidMapping, upnMapping, isLoadingGuids) => {
  if (typeof str !== "string") return { result: str, hasResolvedNames: false };

  let result = str;
  let hasResolvedNames = false;

  // Replace standard GUIDs
  const guidRegex = /[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/gi;
  const guidsInString = str.match(guidRegex) || [];

  guidsInString.forEach((guid) => {
    if (guidMapping[guid]) {
      result = result.replace(new RegExp(guid, "gi"), guidMapping[guid]);
      hasResolvedNames = true;
    }
  });

  // Replace partner UPNs (user_<guid_no_dashes>@partnertenant.onmicrosoft.com)
  const partnerUpnRegex = /user_([0-9a-f]{32})@([^@]+\.onmicrosoft\.com)/gi;
  let match;

  // We need to clone the string to reset the regex lastIndex
  const strForMatching = String(str);

  while ((match = partnerUpnRegex.exec(strForMatching)) !== null) {
    const fullMatch = match[0]; // The complete UPN
    const hexId = match[1];

    if (hexId.length === 32) {
      const guid = [
        hexId.slice(0, 8),
        hexId.slice(8, 12),
        hexId.slice(12, 16),
        hexId.slice(16, 20),
        hexId.slice(20, 32),
      ].join("-");

      // For partner UPN format, use the actual UPN if available, otherwise fall back to display name
      if (upnMapping[guid]) {
        result = result.replace(
          new RegExp(fullMatch.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"),
          upnMapping[guid]
        );
        hasResolvedNames = true;
      } else if (guidMapping[guid]) {
        result = result.replace(
          new RegExp(fullMatch.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"),
          guidMapping[guid]
        );
        hasResolvedNames = true;
      }
    }
  }

  return { result, hasResolvedNames };
};

export const useGuidResolver = (manualTenant = null) => {
  const tenantFilter = useSettings().currentTenant;
  const activeTenant = manualTenant || tenantFilter;

  // GUID resolution state
  const [guidMapping, setGuidMapping] = useState({});
  const [upnMapping, setUpnMapping] = useState({}); // New mapping specifically for UPNs
  const [isLoadingGuids, setIsLoadingGuids] = useState(false);

  // Use refs for values that shouldn't trigger re-renders but need to persist
  const notFoundGuidsRef = useRef(new Set());
  const pendingGuidsRef = useRef([]);
  const pendingPartnerGuidsRef = useRef(new Map()); // Map of tenantDomain -> Set of GUIDs
  const lastRequestTimeRef = useRef(0);
  const lastPartnerRequestTimeRef = useRef(0); // Separate timing for partner tenant calls
  const rateLimitBackoffRef = useRef(2000); // Default backoff time in milliseconds
  const rateLimitTimeoutRef = useRef(null); // For tracking retry timeouts

  // Helper function to retry API call with the correct backoff
  const retryApiCallWithBackoff = useCallback((apiCall, url, data, retryDelay = null) => {
    // Clear any existing timeout
    if (rateLimitTimeoutRef.current) {
      clearTimeout(rateLimitTimeoutRef.current);
    }

    // Use specified delay or current backoff time
    const delay = retryDelay || rateLimitBackoffRef.current;

    // Set timeout to retry
    rateLimitTimeoutRef.current = setTimeout(() => {
      apiCall.mutate({ url, data });
      rateLimitTimeoutRef.current = null;
    }, delay);

    // Increase backoff for future retries (up to a reasonable limit)
    rateLimitBackoffRef.current = Math.min(rateLimitBackoffRef.current * 1.5, 10000);
  }, []);

  // Setup API call for directory objects resolution
  const directoryObjectsMutation = ApiPostCall({
    relatedQueryKeys: ["directoryObjects"],
    onResult: (data) => {
      // Handle rate limit error
      if (data && data.statusCode === 429) {
        console.log("Rate limit hit on directory objects lookup, retrying...");

        // Extract retry time from message if available
        let retryAfterSeconds = 2;
        if (data.message && typeof data.message === "string") {
          const match = data.message.match(/Try again in (\d+) seconds/i);
          if (match && match[1]) {
            retryAfterSeconds = parseInt(match[1], 10) || 2;
          }
        }

        // Retry with the specified delay (convert to milliseconds)
        retryApiCallWithBackoff(
          directoryObjectsMutation,
          "/api/ListDirectoryObjects",
          {
            tenantFilter: activeTenant,
            ids: pendingGuidsRef.current,
            $select: "id,displayName,userPrincipalName,mail",
          },
          retryAfterSeconds * 1000
        );
        return;
      }

      // Reset backoff time on successful request
      rateLimitBackoffRef.current = 2000;

      if (data && Array.isArray(data.value)) {
        const newDisplayMapping = {};
        const newUpnMapping = {};

        // Process the returned results
        data.value.forEach((item) => {
          if (item.id) {
            // For display purposes, prefer displayName > userPrincipalName > mail
            if (item.displayName || item.userPrincipalName || item.mail) {
              newDisplayMapping[item.id] = item.displayName || item.userPrincipalName || item.mail;
            }

            // For UPN replacement, specifically store the UPN when available
            if (item.userPrincipalName) {
              newUpnMapping[item.id] = item.userPrincipalName;
            }
          }
        });

        // Find GUIDs that were sent but not returned in the response
        const processedGuids = new Set(pendingGuidsRef.current);
        const returnedGuids = new Set(data.value.map((item) => item.id));
        const notReturned = [...processedGuids].filter((guid) => !returnedGuids.has(guid));

        // Add unresolved GUIDs to partner tenant fallback lookup
        if (notReturned.length > 0) {
          console.log(
            `${notReturned.length} GUIDs not resolved by primary tenant, trying partner tenant lookup`
          );

          // Add to partner lookup with the current tenant as fallback
          if (!pendingPartnerGuidsRef.current.has(activeTenant)) {
            pendingPartnerGuidsRef.current.set(activeTenant, new Set());
          }
          notReturned.forEach((guid) => {
            pendingPartnerGuidsRef.current.get(activeTenant).add(guid);
          });

          // Trigger partner lookup immediately for fallback
          const now = Date.now();
          if (!rateLimitTimeoutRef.current && now - lastPartnerRequestTimeRef.current >= 2000) {
            lastPartnerRequestTimeRef.current = now;

            // Use partner tenant API for unresolved GUIDs
            console.log(
              `Sending partner fallback request for ${notReturned.length} GUIDs in tenant ${activeTenant}`
            );
            partnerDirectoryObjectsMutation.mutate({
              url: "/api/ListDirectoryObjects",
              data: {
                tenantFilter: activeTenant,
                ids: notReturned,
                $select: "id,displayName,userPrincipalName,mail",
                partnerLookup: true, // Flag to indicate this is a partner lookup
              },
            });
          }
        }

        setGuidMapping((prevMapping) => ({ ...prevMapping, ...newDisplayMapping }));
        setUpnMapping((prevMapping) => ({ ...prevMapping, ...newUpnMapping }));
        pendingGuidsRef.current = [];

        // Only set loading to false if we don't have pending partner lookups
        if (notReturned.length === 0) {
          setIsLoadingGuids(false);
        }
      }
    },
  });

  // Setup API call for partner tenant directory objects resolution
  const partnerDirectoryObjectsMutation = ApiPostCall({
    relatedQueryKeys: ["partnerDirectoryObjects"],
    onResult: (data) => {
      // Handle rate limit error
      if (data && data.statusCode === 429) {
        console.log("Rate limit hit on partner directory objects lookup, retrying...");

        // Extract retry time from message if available
        let retryAfterSeconds = 2;
        if (data.message && typeof data.message === "string") {
          const match = data.message.match(/Try again in (\d+) seconds/i);
          if (match && match[1]) {
            retryAfterSeconds = parseInt(match[1], 10) || 2;
          }
        }

        // We need to preserve the current tenant domain for retry
        const currentTenantEntries = [...pendingPartnerGuidsRef.current.entries()];

        if (currentTenantEntries.length > 0) {
          const [tenantDomain, guidsSet] = currentTenantEntries[0];
          const guidsToRetry = Array.from(guidsSet);

          // Retry with the specified delay (convert to milliseconds)
          retryApiCallWithBackoff(
            partnerDirectoryObjectsMutation,
            "/api/ListDirectoryObjects",
            {
              tenantFilter: tenantDomain,
              ids: guidsToRetry,
              $select: "id,displayName,userPrincipalName,mail",
            },
            retryAfterSeconds * 1000
          );
        }
        return;
      }

      // Reset backoff time on successful request
      rateLimitBackoffRef.current = 2000;

      if (data && Array.isArray(data.value)) {
        const newDisplayMapping = {};
        const newUpnMapping = {};

        // Process the returned results
        data.value.forEach((item) => {
          if (item.id) {
            // For display purposes, prefer userPrincipalName > mail > DisplayName
            if (item.userPrincipalName || item.mail || item.displayName) {
              newDisplayMapping[item.id] = item.userPrincipalName || item.mail || item.displayName;
            }

            // For UPN replacement, specifically store the UPN when available
            if (item.userPrincipalName) {
              newUpnMapping[item.id] = item.userPrincipalName;
            }
          }
        });

        // Find GUIDs that were sent but not returned in the partner lookup
        const allPendingPartnerGuids = new Set();
        pendingPartnerGuidsRef.current.forEach((guidsSet) => {
          guidsSet.forEach((guid) => allPendingPartnerGuids.add(guid));
        });

        const returnedGuids = new Set(data.value.map((item) => item.id));
        const stillNotFound = [...allPendingPartnerGuids].filter(
          (guid) => !returnedGuids.has(guid)
        );

        // Add truly unresolved GUIDs to notFoundGuids
        if (stillNotFound.length > 0) {
          stillNotFound.forEach((guid) => notFoundGuidsRef.current.add(guid));
        }

        setGuidMapping((prevMapping) => ({ ...prevMapping, ...newDisplayMapping }));
        setUpnMapping((prevMapping) => ({ ...prevMapping, ...newUpnMapping }));

        // Clear processed partner GUIDs
        pendingPartnerGuidsRef.current = new Map();
        setIsLoadingGuids(false);
      }
    },
  }); // Function to handle resolving GUIDs
  const resolveGuids = useCallback(
    (objectToScan) => {
      const { guidsSet, partnerGuidsMap } = findGuids(objectToScan);

      // Handle regular GUIDs (current tenant) - these should NOT include partner tenant GUIDs
      if (guidsSet.size > 0) {
        const guidsArray = Array.from(guidsSet);
        const notResolvedGuids = guidsArray.filter(
          (guid) => !guidMapping[guid] && !notFoundGuidsRef.current.has(guid)
        );

        if (notResolvedGuids.length > 0) {
          // Merge new GUIDs with existing pending GUIDs without duplicates
          const allPendingGuids = [...new Set([...pendingGuidsRef.current, ...notResolvedGuids])];
          pendingGuidsRef.current = allPendingGuids;
          setIsLoadingGuids(true);

          // Make API call for primary tenant GUIDs
          const now = Date.now();
          if (!rateLimitTimeoutRef.current && now - lastRequestTimeRef.current >= 2000) {
            lastRequestTimeRef.current = now;

            // Only send a maximum of 1000 GUIDs per request
            const batchSize = 1000;
            const guidsToSend = allPendingGuids.slice(0, batchSize);

            if (guidsToSend.length > 0) {
              console.log(
                `Sending primary tenant request for ${guidsToSend.length} GUIDs in tenant ${activeTenant}`
              );
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

      // Handle partner tenant GUIDs separately
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

            // Make API call for partner tenant - with separate timing from primary tenant
            const now = Date.now();
            if (!rateLimitTimeoutRef.current && now - lastPartnerRequestTimeRef.current >= 2000) {
              lastPartnerRequestTimeRef.current = now;

              // Only send a maximum of 1000 GUIDs per request
              const batchSize = 1000;
              const guidsToSend = notResolvedGuids.slice(0, batchSize);

              if (guidsToSend.length > 0) {
                console.log(
                  `Sending partner tenant request for ${guidsToSend.length} GUIDs in tenant ${tenantDomain}`
                );
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
          }
        });
      }

      // If no GUIDs to process, ensure loading state is false
      if (guidsSet.size === 0 && partnerGuidsMap.size === 0) {
        setIsLoadingGuids(false);
      }
    },
    [guidMapping, activeTenant, directoryObjectsMutation, partnerDirectoryObjectsMutation]
  );

  // Create a memoized version of the string replacement function
  const replaceGuidsAndUpnsInStringMemoized = useCallback(
    (str) => replaceGuidsAndUpnsInString(str, guidMapping, upnMapping, isLoadingGuids),
    [guidMapping, upnMapping, isLoadingGuids]
  );

  // Cleanup function to clear any pending timeouts when the component unmounts
  useEffect(() => {
    return () => {
      if (rateLimitTimeoutRef.current) {
        clearTimeout(rateLimitTimeoutRef.current);
        rateLimitTimeoutRef.current = null;
      }
    };
  }, []);

  return {
    guidMapping,
    upnMapping,
    isLoadingGuids,
    resolveGuids,
    isGuid,
    extractObjectIdFromPartnerUPN,
    replaceGuidsAndUpnsInString: replaceGuidsAndUpnsInStringMemoized,
  };
};
