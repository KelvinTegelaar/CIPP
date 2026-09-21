import { readFile, readdir, writeFile, appendFile } from "node:fs/promises";
import path from "node:path";

// Usage: node validate-json.mjs [--strip <prefix>] <dir> [dir...]
// --strip removes a leading path prefix from reported filenames, so a PR checked
// out into a subdirectory still reports repo-relative paths.
const argv = process.argv.slice(2);
let strip = "";
const roots = [];
for (let i = 0; i < argv.length; i++) {
  if (argv[i] === "--strip") {
    strip = argv[++i] ?? "";
  } else {
    roots.push(argv[i]);
  }
}

async function collect(dir) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules") continue;
      files.push(...(await collect(full)));
    } else if (entry.name.endsWith(".json")) {
      files.push(full);
    }
  }
  return files;
}

const report = (file) => {
  const normalised = file.split(path.sep).join("/");
  return strip && normalised.startsWith(strip) ? normalised.slice(strip.length) : normalised;
};

const failures = [];
let checked = 0;

for (const root of roots) {
  for (const file of await collect(root)) {
    checked++;
    const contents = await readFile(file, "utf8");
    try {
      JSON.parse(contents);
    } catch (error) {
      failures.push({ file: report(file), message: error.message.replace(/\r?\n/g, " ") });
    }
  }
}

for (const { file, message } of failures) {
  // Annotate the PR diff via a GitHub Actions error command.
  console.log(`::error file=${file}::${message}`);
}
console.log(`Checked ${checked} JSON file(s), ${failures.length} invalid.`);

// Hand the results to the workflow so it can comment on the PR.
if (process.env.GITHUB_OUTPUT) {
  await appendFile(process.env.GITHUB_OUTPUT, `invalid_count=${failures.length}\n`);
}
await writeFile("json-validation-results.json", JSON.stringify(failures, null, 2));

process.exit(failures.length > 0 ? 1 : 0);
