import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import {
  buildOutputs,
  fictionalArtifact,
  getScenario,
} from "../app/lib/engine.mjs";

export const artifactDefinitions = [
  {
    filename: "payment-order-mismatch-customer-response.md",
    scenarioId: "payment-order-mismatch",
    output: "customer",
  },
  {
    filename: "payment-order-mismatch-support-brief.md",
    scenarioId: "payment-order-mismatch",
    output: "support",
  },
  {
    filename: "payment-order-mismatch-engineering-escalation.md",
    scenarioId: "payment-order-mismatch",
    output: "engineering",
  },
  {
    filename: "saas-permissions-support-brief.md",
    scenarioId: "saas-permissions",
    output: "support",
  },
  {
    filename: "dns-tls-incident-support-brief.md",
    scenarioId: "dns-tls-incident",
    output: "support",
  },
];

export function renderArtifact(definition) {
  const scenario = getScenario(definition.scenarioId);
  if (!scenario) {
    throw new Error("Unknown scenario: " + definition.scenarioId);
  }
  const outputs = buildOutputs(scenario.caseData);
  const output = outputs[definition.output];
  if (!output) {
    throw new Error("Unknown output: " + definition.output);
  }
  return fictionalArtifact(output, scenario.title);
}

export async function generateExamples(directory) {
  await mkdir(directory, { recursive: true });
  for (const definition of artifactDefinitions) {
    await writeFile(
      path.join(directory, definition.filename),
      renderArtifact(definition),
      "utf8",
    );
  }
}

const currentFile = fileURLToPath(import.meta.url);
const invokedFile = process.argv[1] ? path.resolve(process.argv[1]) : "";

if (currentFile === invokedFile) {
  const projectRoot = path.resolve(path.dirname(currentFile), "..");
  await generateExamples(path.join(projectRoot, "examples"));
  console.log("Generated " + artifactDefinitions.length + " fictional examples.");
}
