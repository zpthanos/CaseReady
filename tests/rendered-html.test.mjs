import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import test from "node:test";

test("builds a self-contained GitHub Pages entry point", async () => {
  const html = await readFile("dist/index.html", "utf8");
  const assets = await readdir("dist/assets");

  assert.match(html, /<title>CaseReady — guided support intake<\/title>/);
  assert.match(html, /https:\/\/zpthanos\.github\.io\/CaseReady\//);
  assert.match(html, /\/CaseReady\/assets\/[^"']+\.js/);
  assert.match(html, /\/CaseReady\/assets\/[^"']+\.css/);
  assert.ok(assets.some((file) => file.endsWith(".js")));
  assert.ok(assets.some((file) => file.endsWith(".css")));
  assert.doesNotMatch(html, /chatgpt\.site/i);
});
