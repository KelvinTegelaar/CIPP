/**
 * CIPP Backup Validation Utility
 * Validates and attempts to repair corrupted backup JSON files
 */

export class BackupValidationError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = "BackupValidationError";
    this.details = details;
  }
}

export const BackupValidator = {
  /**
   * Validates a backup file before attempting to parse
   * @param {string} jsonString - Raw JSON string from file
   * @returns {Object} - Validation result with status and data/errors
   */
  validateBackup(jsonString) {
    const result = {
      isValid: false,
      data: null,
      errors: [],
      warnings: [],
      repaired: false,
      validRows: 0,
      totalRows: 0,
    };

    try {
      // Step 1: Basic checks
      if (!jsonString || jsonString.trim().length === 0) {
        result.errors.push("Backup file is empty");
        return result;
      }

      // Step 2: Try to parse JSON directly first
      let parsedData;
      try {
        parsedData = JSON.parse(jsonString);
      } catch (parseError) {
        result.warnings.push(`Initial JSON parsing failed: ${parseError.message}`);

        // Step 3: Try basic repair
        const repairResult = this._attemptBasicRepair(jsonString);
        if (repairResult.success) {
          try {
            parsedData = JSON.parse(repairResult.repairedJson);
            result.repaired = true;
            result.warnings.push("Backup file was repaired during validation");
          } catch (secondParseError) {
            result.errors.push(
              `JSON parsing failed even after repair: ${secondParseError.message}`
            );
            return result;
          }
        } else {
          result.errors.push(...repairResult.errors);
          return result;
        }
      }

      // Step 4: Validate we have importable data
      const dataValidation = this._validateImportableData(parsedData);
      result.data = dataValidation.cleanData;
      result.validRows = dataValidation.validRows;
      result.totalRows = dataValidation.totalRows;
      result.warnings.push(...dataValidation.warnings);

      // Accept the backup if we have at least some valid rows
      if (dataValidation.validRows > 0) {
        result.isValid = true;
        if (dataValidation.skippedRows > 0) {
          result.warnings.push(
            `${dataValidation.skippedRows} corrupted rows will be skipped during import`
          );
        }
      } else {
        result.errors.push("No valid rows found for import");
      }
    } catch (error) {
      result.errors.push(`Validation failed: ${error.message}`);
    }

    return result;
  },

  /**
   * Attempts basic repair of common JSON issues
   */
  _attemptBasicRepair(jsonString) {
    const result = { success: false, repairedJson: jsonString, errors: [] };

    try {
      let repaired = jsonString;

      // Fix 1: Remove trailing commas
      repaired = repaired.replace(/,(\s*[}\]])/g, "$1");

      // Fix 2: Basic bracket closure (skip newline repair for now)
      const openBraces = (repaired.match(/\{/g) || []).length;
      const closeBraces = (repaired.match(/\}/g) || []).length;
      const openBrackets = (repaired.match(/\[/g) || []).length;
      const closeBrackets = (repaired.match(/\]/g) || []).length;

      if (openBraces - closeBraces > 0 && openBraces - closeBraces < 3) {
        repaired += "}".repeat(openBraces - closeBraces);
      }
      if (openBrackets - closeBrackets > 0 && openBrackets - closeBrackets < 3) {
        repaired += "]".repeat(openBrackets - closeBrackets);
      }

      // Test if repair worked
      try {
        JSON.parse(repaired);
        result.success = true;
        result.repairedJson = repaired;
      } catch (parseError) {
        // If basic repair failed, try advanced repair for corrupted entries
        const advancedResult = this._attemptAdvancedRepair(repaired, parseError);
        if (advancedResult.success) {
          result.success = true;
          result.repairedJson = advancedResult.repairedJson;
        } else {
          result.errors.push(`Basic repair failed: ${parseError.message}`);
          result.errors.push(...advancedResult.errors);
        }
      }
    } catch (error) {
      result.errors.push(`Repair process failed: ${error.message}`);
    }

    return result;
  },

  /**
   * Advanced repair for severely corrupted entries
   * Attempts to isolate and fix/remove corrupted entries that break the entire JSON
   */
  _attemptAdvancedRepair(jsonString, parseError) {
    const result = { success: false, repairedJson: jsonString, errors: [] };

    try {
      // If the error message indicates a specific position, try to isolate the corruption
      const positionMatch = parseError.message.match(/position (\d+)/);
      if (positionMatch) {
        const errorPosition = parseInt(positionMatch[1]);
        result.errors.push(`Attempting to repair corruption at position ${errorPosition}`);

        // Strategy 1: Try to find and isolate the corrupted entry
        const isolatedResult = this._isolateCorruptedEntry(jsonString, errorPosition);
        if (isolatedResult.success) {
          result.success = true;
          result.repairedJson = isolatedResult.repairedJson;
          return result;
        }
        result.errors.push(...isolatedResult.errors);
      }

      // Strategy 2: Try to extract valid entries before corruption
      const truncateResult = this._extractValidEntries(jsonString, parseError);
      if (truncateResult.success) {
        result.success = true;
        result.repairedJson = truncateResult.repairedJson;
        return result;
      }
      result.errors.push(...truncateResult.errors);
    } catch (error) {
      result.errors.push(`Advanced repair failed: ${error.message}`);
    }

    return result;
  },

  /**
   * Attempts to isolate and remove/fix a corrupted entry
   */
  _isolateCorruptedEntry(jsonString, errorPosition) {
    const result = { success: false, repairedJson: jsonString, errors: [] };

    try {
      // Find the object that contains the corruption
      const beforeError = jsonString.substring(0, errorPosition);
      const afterError = jsonString.substring(errorPosition);

      // Look for the last complete object boundary before the error
      const lastObjectStart = beforeError.lastIndexOf('{\n        "PartitionKey"');
      const nextObjectStart = afterError.indexOf('\n    },\n    {\n        "PartitionKey"');

      if (lastObjectStart !== -1 && nextObjectStart !== -1) {
        const beforeCorrupted = jsonString.substring(0, lastObjectStart);
        const afterCorrupted = jsonString.substring(errorPosition + nextObjectStart);

        // Try to reconstruct without the corrupted entry
        let repaired = beforeCorrupted + afterCorrupted;

        // Clean up any resulting syntax issues
        repaired = repaired.replace(/,(\s*[}\]])/g, "$1");
        repaired = repaired.replace(/\{\s*,/g, "{");
        repaired = repaired.replace(/,\s*,/g, ",");

        try {
          JSON.parse(repaired);
          result.success = true;
          result.repairedJson = repaired;
          result.errors.push("Successfully isolated and removed corrupted entry");
          return result;
        } catch (stillError) {
          result.errors.push(`Isolation attempt failed: ${stillError.message}`);
        }
      }
    } catch (error) {
      result.errors.push(`Corruption isolation failed: ${error.message}`);
    }

    return result;
  },

  /**
   * Extracts valid entries up to the point of corruption
   */
  _extractValidEntries(jsonString, parseError) {
    const result = { success: false, repairedJson: jsonString, errors: [] };

    try {
      const positionMatch = parseError.message.match(/position (\d+)/);
      if (!positionMatch) {
        result.errors.push("Cannot determine corruption position");
        return result;
      }

      const errorPosition = parseInt(positionMatch[1]);
      const beforeError = jsonString.substring(0, errorPosition);

      // Find the last complete object before the error
      const lastCompleteObject = beforeError.lastIndexOf("\n    }");

      if (lastCompleteObject !== -1) {
        // Extract everything up to the last complete object
        let validPortion = jsonString.substring(0, lastCompleteObject + 6); // Include the \n    }

        // Ensure proper JSON array closure
        if (!validPortion.trim().endsWith("]")) {
          validPortion += "\n]";
        }

        try {
          const parsed = JSON.parse(validPortion);
          if (Array.isArray(parsed) && parsed.length > 0) {
            result.success = true;
            result.repairedJson = validPortion;
            result.errors.push(`Extracted ${parsed.length} valid entries before corruption`);
            return result;
          }
        } catch (stillError) {
          result.errors.push(`Valid portion extraction failed: ${stillError.message}`);
        }
      }
    } catch (error) {
      result.errors.push(`Entry extraction failed: ${error.message}`);
    }

    return result;
  },

  /**
   * Validates that we have importable data rows
   * Filters out corrupted entries but keeps valid ones
   */
  _validateImportableData(data) {
    const result = {
      cleanData: null,
      validRows: 0,
      totalRows: 0,
      skippedRows: 0,
      warnings: [],
    };

    // Handle non-array data
    if (!Array.isArray(data)) {
      if (data && typeof data === "object") {
        // Single object - wrap in array
        data = [data];
        result.warnings.push("Single object detected, converted to array format");
      } else {
        result.warnings.push("Data is not in expected array format");
        result.cleanData = [];
        return result;
      }
    }

    result.totalRows = data.length;
    const cleanRows = [];

    // Check each row for importability
    data.forEach((row, index) => {
      if (this._isValidImportRow(row)) {
        cleanRows.push(row);
        result.validRows++;
      } else {
        result.skippedRows++;
        result.warnings.push(`Row ${index + 1} skipped: ${this._getRowSkipReason(row)}`);
      }
    });

    result.cleanData = cleanRows;
    return result;
  },

  /**
   * Checks if a row is valid for import into CIPP tables
   */
  _isValidImportRow(row) {
    // Must be an object
    if (!row || typeof row !== "object") {
      return false;
    }

    // Must have all three required properties for CIPP table storage
    const hasTable = row.table && typeof row.table === "string";
    const hasPartitionKey = row.PartitionKey && typeof row.PartitionKey === "string";
    const hasRowKey = row.RowKey && typeof row.RowKey === "string";

    // All three are required for valid CIPP backup row
    if (!hasTable || !hasPartitionKey || !hasRowKey) {
      return false;
    }

    // Additional checks for obvious corruption
    const rowJson = JSON.stringify(row);

    // Skip rows that are way too large (likely corrupted)
    if (rowJson.length > 10000000) {
      // 10MB limit
      return false;
    }

    // Skip rows with null bytes (always corruption)
    if (rowJson.includes("\0")) {
      return false;
    }

    return true;
  },

  /**
   * Gets a human-readable reason why a row was skipped
   */
  _getRowSkipReason(row) {
    if (!row || typeof row !== "object") {
      return "Not a valid object";
    }

    // Check for missing required CIPP backup properties
    const missingFields = [];
    if (!row.table || typeof row.table !== "string") {
      missingFields.push("table");
    }
    if (!row.PartitionKey || typeof row.PartitionKey !== "string") {
      missingFields.push("PartitionKey");
    }
    if (!row.RowKey || typeof row.RowKey !== "string") {
      missingFields.push("RowKey");
    }

    if (missingFields.length > 0) {
      return `Missing required fields: ${missingFields.join(", ")}`;
    }

    const rowJson = JSON.stringify(row);
    if (rowJson.length > 10000000) {
      return "Row too large (likely corrupted)";
    }

    if (rowJson.includes("\0")) {
      return "Contains null bytes (corrupted)";
    }

    return "Unknown validation failure";
  },
};

export default BackupValidator;
