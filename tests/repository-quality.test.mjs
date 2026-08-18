import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const roots = ["app", "docs", "examples", "public", "release-notes"];
const standaloneFiles = ["README.md", "index.source.html"];
const forbidden = [
  /\bTODO\b/,
  /\bTBA\b/,
  /lorem ipsum/i,
  /coming soon/i,
  /Starter Project/,
];

async function collectFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const current = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectFiles(current)));
    } else if (/\.(?:css|html|js|jsx|md|mjs|svg|ts|tsx)$/.test(entry.name)) {
      files.push(current);
    }
  }
  return files;
}

test("published copy contains no unfinished markers", async () => {
  const files = [...standaloneFiles];
  for (const root of roots) {
    files.push(...(await collectFiles(root)));
  }

  for (const file of files) {
    const content = await readFile(file, "utf8");
    for (const pattern of forbidden) {
      assert.doesNotMatch(content, pattern, file + " contains " + pattern);
    }
  }
});
