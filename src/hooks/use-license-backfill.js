import { useEffect, useState } from "react";
import licenseBackfillManager from "../utils/cipp-license-backfill-manager";

/**
 * Hook to trigger re-render when license backfill completes
 * Use this in components that display licenses to automatically update
 * when missing licenses are fetched from the API
 * 
 * @returns {Object} Object containing backfill status
 */
export const useLicenseBackfill = () => {
  const [updateTrigger, setUpdateTrigger] = useState(0);
  const [status, setStatus] = useState(licenseBackfillManager.getStatus());

  useEffect(() => {
    // Subscribe to backfill completion events
    const unsubscribe = licenseBackfillManager.addCallback(() => {
      // Trigger re-render by updating state
      setUpdateTrigger((prev) => prev + 1);
      setStatus(licenseBackfillManager.getStatus());
    });

    // Update status periodically while backfilling
    const interval = setInterval(() => {
      const currentStatus = licenseBackfillManager.getStatus();
      if (currentStatus.isBackfilling !== status.isBackfilling || 
          currentStatus.pendingCount !== status.pendingCount) {
        setStatus(currentStatus);
      }
    }, 200);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [status.isBackfilling, status.pendingCount]);

  return {
    ...status,
    updateTrigger, // Can be used as a key to force re-render if needed
  };
};
