// Workaround for a Next.js 16 build-time waste on `output: 'export'` builds.
//
// Next traces server-side file dependencies with @vercel/nft ("Collecting build traces") on every
// webpack build. For a static export there is NO server runtime, so that trace is never used — yet it
// costs roughly HALF the build wall-clock (measured ~256s; the single biggest serial phase, and on a
// 2-core CI runner it stacks on top of static generation). Next 14 let you skip it with
// `outputFileTracing: false`; Next 15+ removed that option and ships no replacement.
//
// This idempotently patches the installed Next build to gate the NFT step on `config.output !== 'export'`
// — exactly what the old flag did. It's safe: the trace result is never consumed for an export build
// (only `output: 'standalone'` reads it), and Next already does `await buildTracesPromise` where an
// unset (undefined) promise is a no-op. Run it immediately before `next build`. Re-running is harmless.
// Remove once Next skips build traces for `output: 'export'` upstream (track: vercel/next.js).
import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

let target;
try {
  target = require.resolve("next/dist/build/index.js");
} catch {
  console.warn("[skip-export-traces] next/dist/build/index.js not resolvable — skipping (build still works)");
  process.exit(0);
}

const NEEDLE = "!isGenerateMode && !buildTracesPromise) {";
const PATCHED = "!isGenerateMode && !buildTracesPromise && config.output !== 'export') {";

let src = readFileSync(target, "utf8");
if (src.includes(PATCHED)) {
  console.log("[skip-export-traces] already patched — Next will skip build traces for output: export");
} else if (src.includes(NEEDLE)) {
  writeFileSync(target, src.replace(NEEDLE, PATCHED));
  console.log("[skip-export-traces] patched: Next will skip @vercel/nft build traces for output: export");
} else {
  console.warn(
    "[skip-export-traces] WARNING: patch site not found — Next internals changed for this version. " +
      "Build proceeds unpatched (just slower). Re-verify the gate in next/dist/build/index.js."
  );
}
