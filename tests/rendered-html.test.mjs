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

test("keeps the branch deployment mirror aligned with the production build", async () => {
  const builtAssets = (await readdir("dist/assets")).sort();
  const deployedAssets = (await readdir("assets")).sort();

  assert.equal(await readFile("index.html", "utf8"), await readFile("dist/index.html", "utf8"));
  assert.deepEqual(deployedAssets, builtAssets);

  for (const file of builtAssets) {
    assert.deepEqual(
      await readFile(`assets/${file}`),
      await readFile(`dist/assets/${file}`),
      `${file} does not match the verified build`,
    );
  }

  for (const file of ["favicon.svg", "social-preview.svg"]) {
    assert.deepEqual(
      await readFile(file),
      await readFile(`dist/${file}`),
      `${file} does not match the verified build`,
    );
  }
});
