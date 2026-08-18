import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import {
  artifactDefinitions,
  renderArtifact,
} from "../scripts/generate-examples.mjs";

const examplesDirectory = path.resolve("examples");

for (const definition of artifactDefinitions) {
  test(definition.filename + " matches the application generator", async () => {
    const committed = await readFile(
      path.join(examplesDirectory, definition.filename),
      "utf8",
    );
    assert.equal(committed, renderArtifact(definition));
    assert.match(committed, /Fictional demonstration scenario/);
  });
}
