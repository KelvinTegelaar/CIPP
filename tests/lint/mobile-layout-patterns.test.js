import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

// Two MUI patterns account for nearly every mobile layout bug in this app, and both are
// invisible on a desktop screen — so they ship freely and only surface as a phone report.
// This walks src/ and fails on either, which is cheaper than finding them one at a time.
//
//  1. <Grid size={N}> / size={{ xs: N }} with N < 12 holds a desktop column split at 390px.
//  2. A Stack with flexWrap but no useFlexGap: MUI's `spacing` is a margin-left between
//     children, and every wrapped row inherits it, so each new line starts indented.
//  3. A dashboard card pinned to a pixel height. That height exists to level two columns of
//     a desktop grid; below lg the grid is a single column, so it levels nothing and clips
//     instead — the Secure Score card lost its whole stats row off the bottom edge.

const SRC = path.resolve(__dirname, "../../src");

// Dead Devias template code — nothing in pages/, components/ or layouts/ imports it.
const IGNORED_DIRS = new Set(["sections"]);

const walk = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      return IGNORED_DIRS.has(entry.name) ? [] : walk(full);
    }
    return /\.(js|jsx)$/.test(entry.name) ? [full] : [];
  });

const rel = (file) => path.relative(SRC, file);

// Commented-out JSX is not shipped markup — blank it (preserving newlines so reported
// line numbers stay accurate) rather than flagging code nobody renders.
const stripComments = (source) =>
  source
    .replace(/\{\s*\/\*[\s\S]*?\*\/\s*\}/g, (m) => m.replace(/[^\n]/g, " "))
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "));

/** Opening tags for `name`, brace-aware so multi-line JSX props stay in one string. */
const openingTags = (source, name) => {
  const tags = [];
  const re = new RegExp(`<${name}\\b`, "g");
  let match;
  while ((match = re.exec(source))) {
    let depth = 0;
    for (let i = match.index; i < source.length; i += 1) {
      const char = source[i];
      if (char === "{") depth += 1;
      else if (char === "}") depth -= 1;
      else if (char === ">" && depth === 0) {
        const text = source.slice(match.index, i + 1);
        const line = source.slice(0, match.index).split("\n").length;
        tags.push({ text, line, endLine: line + text.split("\n").length - 1 });
        break;
      }
    }
  }
  return tags;
};

// Not every fixed split is a bug — a tile can be designed to sit two-up at 390px. Marking
// the site opts it out, deliberately, in the source, next to the reason, where
// `rg mobile-layout-ok` finds every one of them. Read from the RAW source because comments
// are stripped before matching, and counted on the tag's own lines or the three above it,
// since JSX has nowhere to put a comment between props.
const MARKER = "mobile-layout-ok";
const LOOKBACK = 3;

const isExempt = (marked, tag) => {
  for (let line = tag.line - LOOKBACK; line <= tag.endLine; line += 1) {
    if (marked.has(line)) return true;
  }
  return false;
};

/** Grid splits that survive a phone, as `line reason` strings. */
export const gridOffenders = (rawSource) => {
  const source = stripComments(rawSource);
  const marked = new Set();
  rawSource.split("\n").forEach((text, index) => {
    if (text.includes(MARKER)) marked.add(index + 1);
  });

  const offenders = [];
  for (const tag of openingTags(source, "Grid")) {
    if (isExempt(marked, tag)) continue;
    const bare = tag.text.match(/\bsize=\{(\d+(?:\.\d+)?)\}/);
    if (bare && Number(bare[1]) !== 12) {
      offenders.push(`${tag.line} size={${bare[1]}}`);
    }
    const xs = tag.text.match(/\bsize=\{\{[^}]*?\bxs:\s*(\d+(?:\.\d+)?)/);
    if (xs && Number(xs[1]) < 12) {
      offenders.push(`${tag.line} xs: ${xs[1]}`);
    }
    // v1 props are silently inert under Grid v2 — the split never applied at all
    if (/<Grid\s+(?!item\b)[^>]*\bxs=\{/.test(tag.text)) {
      offenders.push(`${tag.line} legacy xs= prop (inert under Grid v2)`);
    }
  }
  return offenders;
};

/**
 * Percent-width column splits on Box/Stack, as `line reason` strings. The flexbox sibling
 * of the Grid rule above: `<Box width="80%">` beside `<Box width="30%">` holds a desktop
 * split at 390px too — the role editor's summary pane sat off the right edge of a phone
 * this way. A responsive object (`width={{ xs: "100%", xl: "30%" }}`) passes.
 */
export const percentSplitOffenders = (rawSource) => {
  const source = stripComments(rawSource);
  const marked = new Set();
  rawSource.split("\n").forEach((text, index) => {
    if (text.includes(MARKER)) marked.add(index + 1);
  });

  const offenders = [];
  for (const name of ["Box", "Stack"]) {
    for (const tag of openingTags(source, name)) {
      if (isExempt(marked, tag)) continue;
      const percent = tag.text.match(/\bwidth=\{?"(\d{1,2})%"\}?/);
      if (percent) offenders.push(`${tag.line} width="${percent[1]}%"`);
    }
  }
  return offenders;
};

/** Dashboard card wrappers pinned to a pixel height, as `line reason` strings. */
export const pinnedHeightOffenders = (rawSource) => {
  const source = stripComments(rawSource);
  const marked = new Set();
  rawSource.split("\n").forEach((text, index) => {
    if (text.includes(MARKER)) marked.add(index + 1);
  });

  const offenders = [];
  for (const tag of openingTags(source, "Box")) {
    if (isExempt(marked, tag)) continue;
    // `height: 450` — a bare number. `height: { xs: 'auto', lg: 450 }` is the fix, and
    // minHeight/maxHeight are constraints rather than a pin, so both are left alone.
    const pinned = tag.text.match(/[^a-zA-Z]height:\s*(\d+)\s*[,}]/);
    if (pinned) offenders.push(`${tag.line} height: ${pinned[1]}`);
  }
  return offenders;
};

const files = walk(SRC);
const dashboardFiles = files.filter((file) => rel(file).startsWith(path.join("pages", "dashboardv2")));

describe("mobile layout patterns", () => {
  it("has files to check", () => {
    expect(files.length).toBeGreaterThan(100);
  });

  it("declares no Grid column split that survives a phone", () => {
    const offenders = files.flatMap((file) =>
      gridOffenders(fs.readFileSync(file, "utf8")).map((offender) => `${rel(file)}:${offender}`)
    );
    expect(offenders, `Use size={{ xs: 12, sm|md: N }} instead:\n${offenders.join("\n")}`).toEqual(
      []
    );
  });

  it("takes a marked split at its word", () => {
    const split = "      <Grid size={{ xs: 6 }}>\n";
    expect(gridOffenders(split)).toEqual(["1 xs: 6"]);
    // on a line above, which is the only place JSX leaves room for one
    expect(gridOffenders(`      // two-up by design: ${MARKER}\n${split}`)).toEqual([]);
    // or among the props of a tag spanning several lines
    expect(
      gridOffenders(`      <Grid\n        size={{ xs: 6 }}\n        // ${MARKER}\n      >\n`)
    ).toEqual([]);
    // but a marker further up the file does not blanket the rest of it
    expect(gridOffenders(`      // ${MARKER}\n\n\n\n\n${split}`)).toEqual(["6 xs: 6"]);
  });

  it("declares no percent-width flex split that survives a phone", () => {
    const offenders = files.flatMap((file) =>
      percentSplitOffenders(fs.readFileSync(file, "utf8")).map(
        (offender) => `${rel(file)}:${offender}`
      )
    );
    expect(
      offenders,
      `A percent width on Box/Stack holds a desktop split at 390px. Use width={{ xs: "100%", md|xl: "N%" }} or a Grid:\n${offenders.join("\n")}`
    ).toEqual([]);
  });

  it("reads a percent split only as a fixed string width", () => {
    expect(percentSplitOffenders(`      <Box width="30%">\n`)).toEqual(['1 width="30%"']);
    expect(percentSplitOffenders(`      <Box width={"80%"}>\n`)).toEqual(['1 width="80%"']);
    expect(percentSplitOffenders(`      <Box width="100%">\n`)).toEqual([]);
    expect(percentSplitOffenders(`      <Box width={{ xs: "100%", xl: "30%" }}>\n`)).toEqual([]);
    expect(percentSplitOffenders(`      <Skeleton width="80%" />\n`)).toEqual([]);
    expect(percentSplitOffenders(`      // ${MARKER}\n      <Box width="30%">\n`)).toEqual([]);
  });

  it("pins no dashboard card to a pixel height", () => {
    expect(dashboardFiles.length).toBeGreaterThan(0);
    const offenders = dashboardFiles.flatMap((file) =>
      pinnedHeightOffenders(fs.readFileSync(file, "utf8")).map(
        (offender) => `${rel(file)}:${offender}`
      )
    );
    expect(
      offenders,
      `Below lg the dashboard is one column, so a fixed height only clips. Use height: { xs: 'auto', lg: N }:\n${offenders.join("\n")}`
    ).toEqual([]);
  });

  it("reads a pinned height only as a bare number", () => {
    expect(pinnedHeightOffenders(`      <Box sx={{ height: 450 }}>\n`)).toEqual(["1 height: 450"]);
    expect(pinnedHeightOffenders(`      <Box sx={{ height: { xs: 'auto', lg: 450 } }}>\n`)).toEqual([]);
    expect(pinnedHeightOffenders(`      <Box sx={{ minHeight: 450 }}>\n`)).toEqual([]);
    expect(pinnedHeightOffenders(`      <Box sx={{ height: '100%' }}>\n`)).toEqual([]);
    expect(pinnedHeightOffenders(`      // ${MARKER}\n      <Box sx={{ height: 450 }}>\n`)).toEqual([]);
  });

  // Side nav, the drawer that replaces it, the hamburger that opens the drawer and the content
  // gutter are four gates on one decision. Any of them declaring its own query lets them
  // disagree, and a width with no side nav and no way to open the drawer has no nav at all.
  it("keys layout chrome off the shared breakpoint hook, not its own media query", () => {
    const offenders = [];
    for (const name of ["index.js", "top-nav.js"]) {
      const source = stripComments(fs.readFileSync(path.join(SRC, "layouts", name), "utf8"));
      source.split("\n").forEach((line, i) => {
        if (/useMediaQuery\(.*breakpoints\.(down|up|between)\(/.test(line)) {
          offenders.push(`layouts/${name}:${i + 1}`);
        }
      });
    }
    expect(
      offenders,
      `Nav gates have to agree. Use useIsMobileLayout from hooks/use-breakpoint:\n${offenders.join("\n")}`
    ).toEqual([]);
  });

  it("gives every wrapping Stack useFlexGap", () => {
    const offenders = [];
    for (const file of files) {
      const source = stripComments(fs.readFileSync(file, "utf8"));
      if (!source.includes("flexWrap")) continue;
      for (const { text, line } of openingTags(source, "Stack")) {
        if (!text.includes("flexWrap") || text.includes("useFlexGap")) continue;
        if (/flexWrap[=:]\s*[{'"\s]*nowrap/.test(text)) continue;
        offenders.push(`${rel(file)}:${line}`);
      }
    }
    expect(
      offenders,
      `Stack spacing is a margin that wrapped rows inherit — add useFlexGap:\n${offenders.join("\n")}`
    ).toEqual([]);
  });
});
