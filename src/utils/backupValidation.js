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
    };

    try {
      // Step 1: Basic checks
      const basicValidation = this._performBasicValidation(jsonString);
      if (!basicValidation.isValid) {
        // Store initial errors but don't immediately add them to result
        const initialErrors = [...basicValidation.errors];

        // Attempt repair if issues are detected
        const repairResult = this._attemptRepair(jsonString);
        if (repairResult.success) {
          result.warnings.push("Backup file had issues but was successfully repaired");
          result.repaired = true;
          jsonString = repairResult.repairedJson;
          // Clear errors since repair was successful
          // Don't add initialErrors to result.errors
        } else {
          // Add the initial errors since repair failed
          result.errors.push(...initialErrors);

          // If basic repair failed, try advanced repair immediately
          result.warnings.push("Basic repair failed, attempting advanced recovery...");
          const advancedResult = this._attemptAdvancedRepair(jsonString);

          // Test if advanced repair produced valid JSON
          try {
            const advancedData = JSON.parse(advancedResult);
            if (Array.isArray(advancedData) && advancedData.length > 0) {
              result.warnings.push("Advanced recovery successful");
              result.repaired = true;
              jsonString = advancedResult;
              // Clear the basic repair errors since advanced repair worked
              result.errors = [];
            } else {
              result.errors.push(...repairResult.errors);
              return result;
            }
          } catch {
            result.errors.push(...repairResult.errors);
            return result;
          }
        }
      }

      // Step 2: Parse JSON
      let parsedData;
      try {
        parsedData = JSON.parse(jsonString);
      } catch (parseError) {
        result.errors.push(`JSON parsing failed: ${parseError.message}`);
        return result;
      }

      // Step 3: Validate structure and filter out corrupted objects if needed
      const structureValidation = this._validateBackupStructure(parsedData);
      if (!structureValidation.isValid) {
        result.errors.push(...structureValidation.errors);
      }
      result.warnings.push(...structureValidation.warnings);

      // If we had to omit corrupted objects, filter the data to only include valid ones
      if (
        Array.isArray(parsedData) &&
        structureValidation.warnings.some((w) => w.includes("omitted"))
      ) {
        const filteredData = parsedData.filter((item) => this._isValidCippObject(item));
        if (filteredData.length > 0) {
          result.data = filteredData;
          result.repaired = true;
          result.warnings.push(
            `Filtered backup data: ${filteredData.length} valid objects retained`
          );
        } else {
          result.errors.push("No valid objects remaining after filtering corrupted data");
          return result;
        }
      } else {
        result.data = parsedData;
      }

      // Step 4: Validate data integrity
      const integrityValidation = this._validateDataIntegrity(result.data || parsedData);
      if (!integrityValidation.isValid) {
        result.warnings.push(...integrityValidation.warnings);
      }

      result.isValid = result.errors.length === 0;
      if (!result.data) {
        result.data = parsedData;
      }
    } catch (error) {
      result.errors.push(`Validation failed: ${error.message}`);
    }

    return result;
  },

  /**
   * Performs basic validation checks on the raw JSON string
   */
  _performBasicValidation(jsonString) {
    const result = { isValid: true, errors: [] };

    // Check if string is empty or null
    if (!jsonString || jsonString.trim().length === 0) {
      result.isValid = false;
      result.errors.push("Backup file is empty");
      return result;
    }

    // Check for basic JSON structure
    const trimmed = jsonString.trim();
    if (!trimmed.startsWith("[") && !trimmed.startsWith("{")) {
      result.isValid = false;
      result.errors.push("Invalid JSON format: must start with [ or {");
    }

    if (!trimmed.endsWith("]") && !trimmed.endsWith("}")) {
      result.isValid = false;
      result.errors.push("Invalid JSON format: must end with ] or }");
    }

    // Check for common corruption patterns
    const corruptionPatterns = [
      { pattern: /\\\",\"val\w*\":\s*$/, description: "Truncated escape sequences detected" },
      { pattern: /"[^"]*\n[^"]*"/, description: "Unescaped newlines in strings detected" },
      { pattern: /\{[^}]*$/, description: "Unclosed object brackets detected" },
      { pattern: /\[[^\]]*$/, description: "Unclosed array brackets detected" },
      { pattern: /\"[^"]*\\$/, description: "Incomplete escape sequences detected" },
      { pattern: /,\s*[}\]]/, description: "Trailing commas detected" },
    ];

    for (const { pattern, description } of corruptionPatterns) {
      if (pattern.test(jsonString)) {
        result.isValid = false;
        result.errors.push(description);
      }
    }

    return result;
  },

  /**
   * Attempts to repair common JSON corruption issues
   */
  _attemptRepair(jsonString) {
    const result = { success: false, repairedJson: jsonString, errors: [] };

    try {
      let repaired = jsonString;

      // Fix 1: Remove trailing commas
      repaired = repaired.replace(/,(\s*[}\]])/g, "$1");

      // Fix 2: Fix common escape sequence issues
      repaired = repaired.replace(/\\",\\"val/g, '\\",\\"value');

      // Fix 2.5: Fix unescaped newlines within JSON strings
      // Escape literal newline characters within quoted strings to make them valid JSON
      repaired = repaired.replace(/"([^"]*)\n([^"]*)"/g, '"$1\\n$2"');

      // Fix 3: Try to close unclosed brackets (basic attempt)
      const openBraces = (repaired.match(/\{/g) || []).length;
      const closeBraces = (repaired.match(/\}/g) || []).length;
      const openBrackets = (repaired.match(/\[/g) || []).length;
      const closeBrackets = (repaired.match(/\]/g) || []).length;

      // Add missing closing braces/brackets if the difference is reasonable (< 5)
      if (openBraces - closeBraces > 0 && openBraces - closeBraces < 5) {
        repaired += "}}".repeat(openBraces - closeBraces);
      }
      if (openBrackets - closeBrackets > 0 && openBrackets - closeBrackets < 5) {
        repaired += "]".repeat(openBrackets - closeBrackets);
      }

      // Fix 4: Handle corrupted JWT/Base64 tokens that get mixed with other data
      // Pattern: Base64 string followed by unexpected characters then "label"
      repaired = repaired.replace(/([A-Za-z0-9+/=]{50,})"([^"]*)"label/g, '$1"}}, {\\"label');

      // Fix 5: Handle broken string continuation patterns
      repaired = repaired.replace(/"([^"]*)"([A-Za-z]+)":/g, '"$1"},"$2":');

      // Fix 6: Handle truncated strings that jump to new fields
      // Pattern: incomplete string followed by field name without proper closure
      repaired = repaired.replace(/([^\\])"([a-zA-Z_][a-zA-Z0-9_]*)":/g, '$1","$2":');

      // Fix 7: Remove invalid trailing characters after last valid JSON structure
      const lastBraceIndex = repaired.lastIndexOf("}");
      const lastBracketIndex = repaired.lastIndexOf("]");
      const lastValidIndex = Math.max(lastBraceIndex, lastBracketIndex);

      if (lastValidIndex > 0 && lastValidIndex < repaired.length - 1) {
        const afterLastValid = repaired.substring(lastValidIndex + 1).trim();
        // If there's significant content after the last valid structure, it might be corruption
        if (afterLastValid.length > 10 && !afterLastValid.match(/^[\s,]*$/)) {
          repaired = repaired.substring(0, lastValidIndex + 1);
        }
      }

      // Fix 8: Advanced corruption repair - try to find and isolate corrupted entries
      if (!this._isValidJson(repaired)) {
        repaired = this._attemptAdvancedRepair(repaired);
      }

      // Try to parse the repaired JSON
      try {
        JSON.parse(repaired);
        result.success = true;
        result.repairedJson = repaired;
      } catch (parseError) {
        result.errors.push(`Repair attempt failed: ${parseError.message}`);
      }
    } catch (error) {
      result.errors.push(`Repair process failed: ${error.message}`);
    }

    return result;
  },

  /**
   * Helper function to check if a string is valid JSON
   */
  _isValidJson(str) {
    try {
      JSON.parse(str);
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Advanced repair for severely corrupted JSON
   */
  _attemptAdvancedRepair(jsonString) {
    try {
      // Strategy 1: Try to extract individual valid JSON objects from the corrupted string
      // using a robust pattern matching approach that finds complete objects

      const validObjects = [];
      let corruptedCount = 0;

      // Method 1: Look for PartitionKey patterns and extract complete objects
      const partitionKeyPattern = /"PartitionKey"\s*:\s*"[^"]*"/g;
      let partitionMatch;

      while ((partitionMatch = partitionKeyPattern.exec(jsonString)) !== null) {
        try {
          // Find the object that contains this PartitionKey
          const startPos = jsonString.lastIndexOf("{", partitionMatch.index);
          if (startPos === -1) continue;

          // Count braces to find the complete object
          let braceCount = 0;
          let endPos = startPos;

          for (let i = startPos; i < jsonString.length; i++) {
            if (jsonString[i] === "{") braceCount++;
            if (jsonString[i] === "}") braceCount--;

            if (braceCount === 0) {
              endPos = i;
              break;
            }
          }

          if (braceCount === 0) {
            const candidateObject = jsonString.substring(startPos, endPos + 1);

            // Clean up common issues more aggressively
            let cleanObject = candidateObject
              .replace(/,(\s*[}\]])/g, "$1") // Remove trailing commas
              .replace(/([^\\])\\n/g, "$1\\\\n") // Fix unescaped newlines
              .replace(/\n/g, " ") // Replace actual newlines with spaces
              .replace(/([^"\\])\\"([^"]*)\\"([^"\\])/g, '$1"$2"$3') // Fix over-escaped quotes
              .replace(/\\\\/g, "\\"); // Fix double escaping

            try {
              const obj = JSON.parse(cleanObject);
              if (obj.PartitionKey && obj.RowKey && this._isValidCippObject(obj)) {
                // Check if we already added this object (avoid duplicates)
                const duplicate = validObjects.find(
                  (existing) =>
                    existing.PartitionKey === obj.PartitionKey && existing.RowKey === obj.RowKey
                );
                if (!duplicate) {
                  validObjects.push(obj);
                }
              } else {
                corruptedCount++;
              }
            } catch (firstError) {
              // Try more aggressive repair before giving up
              try {
                let aggressiveRepair = candidateObject
                  .replace(/,(\s*[}\]])/g, "$1")
                  .replace(/\n/g, "\\n")
                  .replace(/\r/g, "\\r")
                  .replace(/\t/g, "\\t")
                  .replace(/([^\\])"/g, '$1\\"') // More aggressive quote escaping
                  .replace(/\\\\"$/, '"'); // Fix ending quotes

                const obj2 = JSON.parse(aggressiveRepair);
                if (obj2.PartitionKey && obj2.RowKey) {
                  const duplicate = validObjects.find(
                    (existing) =>
                      existing.PartitionKey === obj2.PartitionKey && existing.RowKey === obj2.RowKey
                  );
                  if (!duplicate) {
                    validObjects.push(obj2);
                  }
                } else {
                  corruptedCount++;
                }
              } catch (secondError) {
                corruptedCount++;
              }
            }
          }
        } catch {
          corruptedCount++;
        }
      }

      if (validObjects.length > 0) {
        console.log(
          `Recovered ${validObjects.length} valid objects, omitted ${corruptedCount} corrupted objects`
        );
        return JSON.stringify(validObjects);
      }

      // Strategy 2: Try line-by-line parsing for objects that span multiple lines
      const lines = jsonString.split("\n");
      let currentObject = "";
      let braceCount = 0;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        if (line.startsWith('{"PartitionKey"')) {
          currentObject = line;
          braceCount = (line.match(/\{/g) || []).length - (line.match(/\}/g) || []).length;
        } else if (currentObject && braceCount > 0) {
          currentObject += line;
          braceCount += (line.match(/\{/g) || []).length - (line.match(/\}/g) || []).length;
        }

        // If we have a complete object (braces balanced)
        if (currentObject && braceCount === 0) {
          try {
            // Remove trailing comma if present
            const cleanObject = currentObject.replace(/,$/, "");
            const obj = JSON.parse(cleanObject);

            if (obj.PartitionKey && obj.RowKey && this._isValidCippObject(obj)) {
              validObjects.push(obj);
            } else {
              corruptedCount++;
            }
          } catch {
            corruptedCount++;
          }

          currentObject = "";
        }
      }

      if (validObjects.length > 0) {
        console.log(
          `Line-by-line recovery: ${validObjects.length} valid objects, omitted ${corruptedCount} corrupted objects`
        );
        return JSON.stringify(validObjects);
      }

      // Strategy 3: More aggressive pattern matching for partial objects
      console.log("Attempting aggressive pattern-based recovery...");

      // First, try to fix common newline issues in the original string
      let cleanedJson = jsonString;

      // Fix unescaped newlines within property values (but preserve structural JSON)
      cleanedJson = cleanedJson.replace(/"([^"]*)\n([^"]*)"/g, '"$1\\n$2"');

      // Try parsing the cleaned version first
      try {
        const cleanedParsed = JSON.parse(cleanedJson);
        if (Array.isArray(cleanedParsed)) {
          const validCleanedObjects = cleanedParsed.filter((obj) => this._isValidCippObject(obj));
          if (validCleanedObjects.length > 0) {
            console.log(`Newline repair: ${validCleanedObjects.length} objects recovered`);
            return JSON.stringify(validCleanedObjects);
          }
        }
      } catch (e) {
        // Continue with aggressive pattern matching
      }

      const aggressivePattern =
        /"PartitionKey"\s*:\s*"([^"]*)"[\s\S]*?"RowKey"\s*:\s*"([^"]*)"[\s\S]*?(?="PartitionKey"|$)/g;
      let aggressiveMatch;

      while ((aggressiveMatch = aggressivePattern.exec(cleanedJson)) !== null) {
        try {
          const partitionKey = aggressiveMatch[1];
          const rowKey = aggressiveMatch[2];
          const candidateText = aggressiveMatch[0];

          // Try to reconstruct a minimal valid object
          const minimalObject = {
            PartitionKey: partitionKey,
            RowKey: rowKey,
          };

          // Extract additional fields using regex
          const fieldPattern = /"([^"]+)"\s*:\s*"([^"]*)"/g;
          let fieldMatch;

          while ((fieldMatch = fieldPattern.exec(candidateText)) !== null) {
            const fieldName = fieldMatch[1];
            const fieldValue = fieldMatch[2];

            // Skip the fields we already have and avoid problematic ones
            if (
              fieldName !== "PartitionKey" &&
              fieldName !== "RowKey" &&
              fieldValue.length < 10000 &&
              !fieldValue.includes('"PartitionKey"')
            ) {
              minimalObject[fieldName] = fieldValue;
            }
          }

          // Only add if we have at least 3 fields (PartitionKey, RowKey, and one more)
          if (Object.keys(minimalObject).length >= 3) {
            const duplicate = validObjects.find(
              (existing) =>
                existing.PartitionKey === minimalObject.PartitionKey &&
                existing.RowKey === minimalObject.RowKey
            );
            if (!duplicate) {
              validObjects.push(minimalObject);
            }
          }
        } catch {
          // Skip this match
        }
      }

      if (validObjects.length > 0) {
        console.log(`Aggressive recovery: ${validObjects.length} partial objects reconstructed`);
        return JSON.stringify(validObjects);
      }

      // Strategy 4: If that fails, try to truncate at the first major corruption point
      for (let i = 0; i < lines.length; i++) {
        try {
          const partialJson = lines.slice(0, i + 1).join("\n");
          // Try to fix basic bracket issues and test
          let testJson = partialJson;
          const openBraces = (testJson.match(/\{/g) || []).length;
          const closeBraces = (testJson.match(/\}/g) || []).length;
          const openBrackets = (testJson.match(/\[/g) || []).length;
          const closeBrackets = (testJson.match(/\]/g) || []).length;

          // Add missing closures
          if (openBraces > closeBraces) {
            testJson += "}".repeat(openBraces - closeBraces);
          }
          if (openBrackets > closeBrackets) {
            testJson += "]".repeat(openBrackets - closeBrackets);
          }

          const parsed = JSON.parse(testJson);
          if (Array.isArray(parsed) && parsed.length > 0) {
            // Filter out any invalid objects from the truncated result
            const validParsed = parsed.filter((obj) => this._isValidCippObject(obj));
            if (validParsed.length > 0) {
              console.log(`Truncation recovery: ${validParsed.length} valid objects recovered`);
              return JSON.stringify(validParsed);
            }
          }
        } catch {
          continue;
        }
      }
    } catch (error) {
      console.warn("Advanced repair failed:", error);
    }

    return jsonString; // Return original if all repairs fail
  },

  /**
   * Validates if an object is a valid CIPP backup object
   */
  _isValidCippObject(obj) {
    try {
      // Basic structure validation
      if (typeof obj !== "object" || obj === null) {
        return false;
      }

      // Required fields for CIPP backup objects
      if (!obj.PartitionKey || !obj.RowKey) {
        return false;
      }

      // Check for obvious corruption patterns in string values
      for (const [key, value] of Object.entries(obj)) {
        if (typeof value === "string") {
          // Check for common corruption indicators
          if (
            value.includes("\0") || // Null bytes
            value.length > 500000
          ) {
            // Very large strings (>500KB)
            return false;
          }

          // More specific JWT token corruption pattern - only flag if clearly corrupted
          // Look for Base64 that's truncated mid-token and followed by unescaped content
          if (value.match(/[A-Za-z0-9+/=]{100,}[^A-Za-z0-9+/=\s].*"label"[^"]*"[^"]*"[a-zA-Z]/)) {
            console.log(`Detected severe JWT corruption in ${key}: ${value.substring(0, 100)}...`);
            return false;
          }

          // Check for obvious object data mixing (but be more lenient)
          if (
            (value.includes('"PartitionKey":"') &&
              value.includes('"RowKey":"') &&
              value.includes('"table":"')) ||
            value.match(/"PartitionKey":"[^"]*","RowKey":"[^"]*"/)
          ) {
            console.log(`Detected obvious object mixing in ${key}`);
            return false;
          }

          // Check for severely broken JSON structure within strings
          if (value.includes('"},"') && value.includes('{"') && !this._looksLikeValidJson(value)) {
            // Try to determine if this is actually corrupted or just complex nested JSON
            const jsonChunks = value.split('"},');
            let validChunks = 0;
            for (const chunk of jsonChunks.slice(0, 3)) {
              // Check first few chunks
              try {
                JSON.parse(chunk + "}");
                validChunks++;
              } catch {
                // Invalid chunk
              }
            }

            // If most chunks are invalid, consider it corrupted
            if (validChunks === 0 && jsonChunks.length > 1) {
              console.log(`Detected broken JSON structure in ${key}`);
              return false;
            }
          }

          // If it looks like JSON, try to parse it (but be more forgiving)
          if (this._looksLikeJson(value)) {
            try {
              JSON.parse(value);
            } catch (parseError) {
              // Try some basic repairs before giving up
              const repairedValue = this._attemptStringRepair(value);
              try {
                JSON.parse(repairedValue);
                // If repair succeeded, continue with the object
              } catch {
                // Only reject if repair also failed
                return false;
              }
            }
          }
        }
      }

      return true;
    } catch {
      return false;
    }
  },

  /**
   * Attempt basic repairs on corrupted JSON strings
   */
  _attemptStringRepair(str) {
    let repaired = str;

    // Fix common issues
    repaired = repaired.replace(/,(\s*[}\]])/g, "$1"); // Remove trailing commas
    repaired = repaired.replace(/([^\\])\\n/g, "$1\\\\n"); // Fix unescaped newlines
    repaired = repaired.replace(/\n/g, " "); // Replace actual newlines with spaces
    repaired = repaired.replace(/([^\\])"/g, '$1\\"'); // Fix unescaped quotes (be careful)

    return repaired;
  },

  /**
   * More strict validation for JSON-like strings
   */
  _looksLikeValidJson(str) {
    if (typeof str !== "string" || str.length < 2) return false;
    const trimmed = str.trim();

    // Must start and end with proper JSON delimiters
    if (trimmed.startsWith("{") && trimmed.endsWith("}")) return true;
    if (trimmed.startsWith("[") && trimmed.endsWith("]")) return true;
    if (trimmed.startsWith('"') && trimmed.endsWith('"')) return true;

    return false;
  },

  /**
   * Validates the structure of parsed backup data
   */
  _validateBackupStructure(data) {
    const result = { isValid: true, errors: [], warnings: [] };

    // Check if data is an array (expected format for CIPP backups)
    if (!Array.isArray(data)) {
      result.warnings.push("Backup data is not an array - may be an older format");
    }

    // If it's an array, validate each entry
    if (Array.isArray(data)) {
      let validCount = 0;
      let invalidCount = 0;

      data.forEach((item, index) => {
        if (typeof item !== "object" || item === null) {
          result.warnings.push(`Item at index ${index} is not a valid object`);
          invalidCount++;
          return;
        }

        // Check for required CIPP backup fields
        const expectedFields = ["PartitionKey", "RowKey"];
        const missingFields = expectedFields.filter((field) => !(field in item));

        if (missingFields.length > 0) {
          result.warnings.push(
            `Item at index ${index} missing required fields: ${missingFields.join(", ")}`
          );
          invalidCount++;
          return;
        }

        // Additional validation using the CIPP object validator
        if (!this._isValidCippObject(item)) {
          result.warnings.push(`Item at index ${index} contains corrupted data and was omitted`);
          invalidCount++;
          return;
        }

        validCount++;

        // Check for corrupted JSON strings within valid objects
        Object.keys(item).forEach((key) => {
          const value = item[key];
          if (typeof value === "string" && this._looksLikeJson(value)) {
            try {
              JSON.parse(value);
            } catch {
              result.warnings.push(
                `Item at index ${index}, field '${key}' contains invalid JSON but object was kept`
              );
            }
          }
        });
      });

      // Summary information
      if (invalidCount > 0) {
        result.warnings.push(
          `Backup recovery summary: ${validCount} valid objects restored, ${invalidCount} corrupted objects omitted`
        );
      }

      // Only mark as invalid if we have no valid objects at all
      if (validCount === 0 && data.length > 0) {
        result.isValid = false;
        result.errors.push("No valid CIPP backup objects found");
      }
    }

    return result;
  },

  /**
   * Validates data integrity and completeness
   */
  _validateDataIntegrity(data) {
    const result = { isValid: true, warnings: [] };

    if (Array.isArray(data)) {
      // Check for duplicate entries
      const seen = new Set();
      const duplicates = [];

      data.forEach((item, index) => {
        if (item.PartitionKey && item.RowKey) {
          const key = `${item.PartitionKey}:${item.RowKey}`;
          if (seen.has(key)) {
            duplicates.push(`Duplicate entry at index ${index}: ${key}`);
          } else {
            seen.add(key);
          }
        }
      });

      if (duplicates.length > 0) {
        result.warnings.push(...duplicates);
      }

      // Check for suspiciously large entries (potential corruption)
      data.forEach((item, index) => {
        const itemSize = JSON.stringify(item).length;
        if (itemSize > 50000) {
          // 50KB threshold
          result.warnings.push(
            `Item at index ${index} is unusually large (${itemSize} bytes) - may be corrupted`
          );
        }
      });

      // Basic statistics
      const tables = data.map((item) => item.table).filter(Boolean);
      const uniqueTables = [...new Set(tables)];

      if (uniqueTables.length === 0) {
        result.warnings.push("No table information found in backup");
      }
    }

    return result;
  },

  /**
   * Helper function to detect if a string looks like JSON
   */
  _looksLikeJson(str) {
    if (typeof str !== "string" || str.length < 2) return false;
    const trimmed = str.trim();
    return (
      (trimmed.startsWith("{") && trimmed.includes("}")) ||
      (trimmed.startsWith("[") && trimmed.includes("]"))
    );
  },

  /**
   * Sanitizes backup data for display/logging purposes
   */
  sanitizeForDisplay(data, maxLength = 100) {
    if (typeof data === "string") {
      return data.length > maxLength ? data.substring(0, maxLength) + "..." : data;
    }

    try {
      const jsonStr = JSON.stringify(data);
      return jsonStr.length > maxLength ? jsonStr.substring(0, maxLength) + "..." : jsonStr;
    } catch {
      return "[Unserializable data]";
    }
  },
};

export default BackupValidator;
