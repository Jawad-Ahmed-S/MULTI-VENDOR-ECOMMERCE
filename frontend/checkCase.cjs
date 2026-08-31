#!/usr/bin/env node
/**
 * check-case-sensitivity.js
 *
 * Scans a frontend project for case-sensitivity issues that work fine on
 * case-insensitive filesystems (Windows / macOS default) but break Linux
 * builds (case-sensitive filesystem).
 *
 * Detects two classes of problems:
 *
 * 1. IMPORT/REQUIRE MISMATCHES
 *    e.g. code does `import Button from './components/Button'`
 *    but the actual file on disk is `./components/button.jsx`
 *
 * 2. SIBLING NAME COLLISIONS
 *    e.g. `Button.jsx` and `button.jsx` both exist in the same folder
 *    (usually a sign one was accidentally duplicated with different casing,
 *    often from git on a case-insensitive machine)
 *
 * Usage:
 *    node check-case-sensitivity.js [path_to_project]
 *
 * No dependencies - uses only Node's built-in fs/path modules.
 */

const fs = require("fs");
const path = require("path");

const CODE_EXTENSIONS = new Set([".js", ".jsx", ".ts", ".tsx", ".mjs", ".cjs", ".vue"]);
const RESOLVABLE_EXTENSIONS = ["", ".js", ".jsx", ".ts", ".tsx", ".json", ".css", ".scss", ".vue"];
const IGNORE_DIRS = new Set(["node_modules", ".git", "dist", "build", ".next", "out", "coverage", ".turbo"]);

// Matches: import ... from '...'  |  import '...'  |  require('...')  |  export ... from '...'
const IMPORT_RE = /(?:import\s+(?:[^'"]+?\s+from\s+)?|export\s+(?:[^'"]+?\s+from\s+)?|require\s*\(\s*)['"]([^'"]+)['"]/g;

function shouldIgnore(name) {
  return IGNORE_DIRS.has(name) || name.startsWith(".");
}

function walk(root, onDir) {
  const results = [];
  function recurse(dir) {
    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    const dirNames = entries.filter((e) => e.isDirectory()).map((e) => e.name);
    const fileNames = entries.filter((e) => e.isFile()).map((e) => e.name);

    if (onDir) onDir(dir, dirNames, fileNames);

    for (const d of dirNames) {
      if (!shouldIgnore(d)) recurse(path.join(dir, d));
    }
  }
  recurse(root);
  return results;
}

function findCaseCollisions(root) {
  const collisions = [];
  walk(root, (dir, dirNames, fileNames) => {
    for (const [group, label] of [
      [dirNames, "directory"],
      [fileNames, "file"],
    ]) {
      const seen = new Map();
      for (const name of group) {
        const key = name.toLowerCase();
        if (!seen.has(key)) seen.set(key, []);
        seen.get(key).push(name);
      }
      for (const names of seen.values()) {
        if (names.length > 1) collisions.push({ dir, label, names });
      }
    }
  });
  return collisions;
}

function extractImports(filepath) {
  let content;
  try {
    content = fs.readFileSync(filepath, "utf-8");
  } catch {
    return [];
  }
  const imports = [];
  let match;
  IMPORT_RE.lastIndex = 0;
  while ((match = IMPORT_RE.exec(content)) !== null) {
    imports.push(match[1]);
  }
  return imports;
}

/**
 * Try to resolve a relative import to a real file, case-insensitively,
 * and report back the actual casing found on disk (if any).
 * Returns { resolved, exact } or null if nothing matches at all
 * (e.g. it's a package import - not our concern).
 */
function resolveOnDisk(baseDir, importPath) {
  const target = path.normalize(path.join(baseDir, importPath));

  const candidates = RESOLVABLE_EXTENSIONS.map((ext) => target + ext);
  for (const ext of RESOLVABLE_EXTENSIONS) {
    if (ext) candidates.push(path.join(target, "index" + ext));
  }

  for (const candidate of candidates) {
    const parent = path.dirname(candidate);
    const wantName = path.basename(candidate);
    let actualNames;
    try {
      if (!fs.statSync(parent).isDirectory()) continue;
      actualNames = fs.readdirSync(parent);
    } catch {
      continue;
    }
    for (const actual of actualNames) {
      if (actual === wantName) return { resolved: candidate, exact: true };
      if (actual.toLowerCase() === wantName.toLowerCase()) {
        return { resolved: path.join(parent, actual), exact: false };
      }
    }
  }
  return null;
}

function findImportMismatches(root) {
  const mismatches = [];
  walk(root, (dir, dirNames, fileNames) => {
    for (const filename of fileNames) {
      if (!CODE_EXTENSIONS.has(path.extname(filename))) continue;
      const filepath = path.join(dir, filename);
      for (const importPath of extractImports(filepath)) {
        if (!(importPath.startsWith(".") || importPath.startsWith("/"))) continue;
        const baseDir = importPath.startsWith(".") ? dir : root;
        const result = resolveOnDisk(baseDir, importPath);
        if (result && !result.exact) {
          mismatches.push({
            filepath,
            importPath,
            actual: path.relative(root, result.resolved),
          });
        }
      }
    }
  });
  return mismatches;
}

function main() {
  const root = path.resolve(process.argv[2] || ".");

  if (!fs.existsSync(root) || !fs.statSync(root).isDirectory()) {
    console.error(`Error: '${root}' is not a directory`);
    process.exit(1);
  }

  console.log(`Scanning: ${root}\n`);

  console.log("=".repeat(70));
  console.log("1. IMPORT PATH CASE MISMATCHES");
  console.log("=".repeat(70));
  const mismatches = findImportMismatches(root);
  if (mismatches.length === 0) {
    console.log("None found.\n");
  } else {
    for (const m of mismatches) {
      console.log(`\n  File:      ${path.relative(root, m.filepath)}`);
      console.log(`  Imports:   '${m.importPath}'`);
      console.log(`  Actual on disk: ${m.actual}`);
    }
    console.log(`\nTotal: ${mismatches.length} mismatch(es)\n`);
  }

  console.log("=".repeat(70));
  console.log("2. FILE/FOLDER NAME COLLISIONS (differ only by case)");
  console.log("=".repeat(70));
  const collisions = findCaseCollisions(root);
  if (collisions.length === 0) {
    console.log("None found.\n");
  } else {
    for (const c of collisions) {
      console.log(`\n  In: ${path.relative(root, c.dir) || "."}`);
      console.log(`  Conflicting ${c.label}s: ${JSON.stringify(c.names)}`);
    }
    console.log(`\nTotal: ${collisions.length} collision(s)\n`);
  }

  const totalIssues = mismatches.length + collisions.length;
  console.log("=".repeat(70));
  if (totalIssues === 0) {
    console.log("No case-sensitivity issues found.");
  } else {
    console.log(`Found ${totalIssues} issue(s) total. Fix these before deploying to Linux.`);
    process.exit(1);
  }
}

main();