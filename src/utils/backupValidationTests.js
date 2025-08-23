/**
 * Test suite for CIPP Backup Validation
 */
import { BackupValidator } from "../utils/backupValidation.js";

// Test cases based on the bad-json.json patterns
const testCases = {
  validBackup: {
    name: "Valid Backup",
    data: JSON.stringify([
      {
        PartitionKey: "TestKey",
        RowKey: "TestRow",
        table: "TestTable",
        data: "test data",
      },
    ]),
    expectedValid: true,
  },

  emptyFile: {
    name: "Empty File",
    data: "",
    expectedValid: false,
  },

  truncatedEscapes: {
    name: "Truncated Escape Sequences",
    data: '[{"PartitionKey":"Test","value":"truncated\\",,"RowKey":"test"]',
    expectedValid: false,
  },

  unclosedBrackets: {
    name: "Unclosed Brackets",
    data: '[{"PartitionKey":"Test","RowKey":"test","data":{"nested":"value"',
    expectedValid: false,
  },

  trailingCommas: {
    name: "Trailing Commas",
    data: '[{"PartitionKey":"Test","RowKey":"test",}]',
    expectedValid: false,
  },

  corruptedMiddle: {
    name: "Corrupted in Middle",
    data: '[{"PartitionKey":"Test1","RowKey":"test1"},{"PartitionKey":"Test2\\",,"RowKey":"incomplete"},{"PartitionKey":"Test3","RowKey":"test3"}]',
    expectedValid: false,
  },

  malformedJson: {
    name: "Malformed JSON Structure",
    data: '{"not": "an array", "but": "object"}',
    expectedValid: true, // Should warn but still be valid
  },

  duplicateEntries: {
    name: "Duplicate Entries",
    data: JSON.stringify([
      { PartitionKey: "Test", RowKey: "duplicate", table: "TestTable" },
      { PartitionKey: "Test", RowKey: "duplicate", table: "TestTable" },
    ]),
    expectedValid: true, // Should warn but still be valid
  },
};

/**
 * Run all test cases and log results
 */
export function runBackupValidationTests() {
  console.log("🧪 Running CIPP Backup Validation Tests...\n");

  let passed = 0;
  let failed = 0;

  Object.entries(testCases).forEach(([key, testCase]) => {
    console.log(`Testing: ${testCase.name}`);

    try {
      const result = BackupValidator.validateBackup(testCase.data);

      const testPassed = result.isValid === testCase.expectedValid;

      if (testPassed) {
        console.log(`✅ PASS - Valid: ${result.isValid}, Repaired: ${result.repaired}`);
        passed++;
      } else {
        console.log(`❌ FAIL - Expected: ${testCase.expectedValid}, Got: ${result.isValid}`);
        failed++;
      }

      if (result.errors.length > 0) {
        console.log(`   Errors: ${result.errors.join(", ")}`);
      }

      if (result.warnings.length > 0) {
        console.log(`   Warnings: ${result.warnings.join(", ")}`);
      }
    } catch (error) {
      console.log(`❌ FAIL - Exception: ${error.message}`);
      failed++;
    }

    console.log("");
  });

  console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed`);

  if (failed === 0) {
    console.log("🎉 All tests passed!");
  } else {
    console.log("⚠️ Some tests failed - check implementation");
  }
}

/**
 * Test with actual corrupted data from bad-json.json pattern
 */
export function testWithCorruptedSample() {
  console.log("🔍 Testing with corrupted sample data...\n");

  // Simulate the corrupted pattern from the bad-json.json file
  const corruptedSample = `[{"PartitionKey":"CIPP-SAM","RowKey":"CIPP-SAM","Permissions":"{\\"00000003-0000-0000-c000-000000000000\\":{\\"delegatedPermissions\\":[{\\"id\\":\\"bdfbf15f-ee85-4955-8675-146e8e5296b5\\",\\"value\\":\\"Application.ReadWrite.All\\"}],\\"applicationPermissions\\":[{\\"id\\":\\"1bfefb4e-e0b5-418b-a88f-73c46d2cc8e9\\",\\"val`;

  const result = BackupValidator.validateBackup(corruptedSample);

  console.log("Validation Result:");
  console.log(`- Valid: ${result.isValid}`);
  console.log(`- Repaired: ${result.repaired}`);
  console.log(`- Errors: ${result.errors.length > 0 ? result.errors.join(", ") : "None"}`);
  console.log(`- Warnings: ${result.warnings.length > 0 ? result.warnings.join(", ") : "None"}`);

  if (result.data) {
    console.log(
      `- Parsed entries: ${Array.isArray(result.data) ? result.data.length : "Not array"}`
    );
  }
}

// Export for console testing
if (typeof window !== "undefined") {
  window.testBackupValidation = runBackupValidationTests;
  window.testCorruptedSample = testWithCorruptedSample;
}
