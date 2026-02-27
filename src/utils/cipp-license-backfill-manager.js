/**
 * Global license backfill manager
 * Tracks missing licenses and triggers batch API calls to fetch them
 */

import { getMissingFromCache, addLicensesToCache } from "./cipp-license-cache";

class LicenseBackfillManager {
  constructor() {
    this.pendingSkuIds = new Set();
    this.isBackfilling = false;
    this.backfillTimeout = null;
    this.callbacks = new Set();
    this.BATCH_DELAY = 500; // Wait 500ms to batch multiple requests
  }

  /**
   * Add a callback to be notified when backfill completes
   */
  addCallback(callback) {
    this.callbacks.add(callback);
    return () => this.callbacks.delete(callback);
  }

  /**
   * Notify all callbacks
   */
  notifyCallbacks() {
    this.callbacks.forEach((callback) => {
      try {
        callback();
      } catch (error) {
        console.error("Error in backfill callback:", error);
      }
    });
  }

  /**
   * Add missing skuIds to the queue
   */
  addMissingSkuIds(skuIds) {
    if (!Array.isArray(skuIds)) return;

    let added = false;
    skuIds.forEach((skuId) => {
      if (skuId && !this.pendingSkuIds.has(skuId)) {
        this.pendingSkuIds.add(skuId);
        added = true;
      }
    });

    if (added && !this.isBackfilling) {
      this.scheduleBatchBackfill();
    }
  }

  /**
   * Schedule a batch backfill with debouncing
   */
  scheduleBatchBackfill() {
    // Clear existing timeout to debounce
    if (this.backfillTimeout) {
      clearTimeout(this.backfillTimeout);
    }

    // Schedule new backfill
    this.backfillTimeout = setTimeout(() => {
      this.executeBatchBackfill();
    }, this.BATCH_DELAY);
  }

  /**
   * Execute the batch backfill
   */
  async executeBatchBackfill() {
    if (this.isBackfilling || this.pendingSkuIds.size === 0) {
      return;
    }

    // Get all pending skuIds
    const skuIdsToFetch = Array.from(this.pendingSkuIds);
    this.pendingSkuIds.clear();
    this.isBackfilling = true;

    try {
      // Import axios dynamically to avoid circular dependencies
      const axios = (await import("axios")).default;
      const { buildVersionedHeaders } = await import("./cippVersion");

      console.log(`[License Backfill] Fetching ${skuIdsToFetch.length} licenses...`);

      const response = await axios.post(
        "/api/ExecLicenseSearch",
        { skuIds: skuIdsToFetch },
        { headers: await buildVersionedHeaders() }
      );

      if (response.data && Array.isArray(response.data)) {
        console.log(`[License Backfill] Received ${response.data.length} licenses`);
        addLicensesToCache(response.data);
        
        // Notify all callbacks that backfill completed
        this.notifyCallbacks();
      }
    } catch (error) {
      console.error("[License Backfill] Error fetching licenses:", error);
      
      // Re-add failed skuIds back to pending if we want to retry
      // Commenting this out to avoid infinite retry loops
      // skuIdsToFetch.forEach(skuId => this.pendingSkuIds.add(skuId));
    } finally {
      this.isBackfilling = false;

      // If more skuIds were added during backfill, schedule another batch
      if (this.pendingSkuIds.size > 0) {
        this.scheduleBatchBackfill();
      }
    }
  }

  /**
   * Check skuIds and add missing ones to backfill queue
   */
  checkAndQueueMissing(skuIds) {
    const missing = getMissingFromCache(skuIds);
    if (missing.length > 0) {
      this.addMissingSkuIds(missing);
      return true;
    }
    return false;
  }

  /**
   * Get current backfill status
   */
  getStatus() {
    return {
      isBackfilling: this.isBackfilling,
      pendingCount: this.pendingSkuIds.size,
    };
  }

  /**
   * Clear all pending requests (useful for cleanup/testing)
   */
  clear() {
    if (this.backfillTimeout) {
      clearTimeout(this.backfillTimeout);
      this.backfillTimeout = null;
    }
    this.pendingSkuIds.clear();
    this.isBackfilling = false;
    this.callbacks.clear();
  }
}

// Global singleton instance
const licenseBackfillManager = new LicenseBackfillManager();

export default licenseBackfillManager;
