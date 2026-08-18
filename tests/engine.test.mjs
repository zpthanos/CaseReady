import assert from "node:assert/strict";
import test from "node:test";
import {
  buildOutputs,
  containsSensitiveData,
  getScenario,
  outputToMarkdown,
  scenarios,
  suggestSeverity,
} from "../app/lib/engine.mjs";

test("ships three complete fictional demonstration scenarios", () => {
  assert.equal(scenarios.length, 3);
  for (const scenario of scenarios) {
    assert.match(scenario.caseData.organisation, /\(fictional\)/i);
    assert.ok(scenario.caseData.objective);
    assert.ok(scenario.caseData.exactNeed);
  }
});

test("suggests severity from impact and urgency without locking it", () => {
  assert.equal(
    suggestSeverity({
      serviceStatus: "unavailable",
      scope: "all",
      workaround: "no",
      deadline: "blocking",
    }),
    "S1",
  );
  assert.equal(
    suggestSeverity({
      serviceStatus: "degraded",
      scope: "single",
      workaround: "no",
      deadline: "time_sensitive",
    }),
    "S3",
  );
});

test("builds different outputs from the same recorded facts", () => {
  const scenario = getScenario("payment-order-mismatch");
  assert.ok(scenario);
  const outputs = buildOutputs(scenario.caseData);
  const customer = outputToMarkdown(outputs.customer);
  const support = outputToMarkdown(outputs.support);
  const engineering = outputToMarkdown(outputs.engineering);

  assert.match(customer, /next update/i);
  assert.match(customer, /do not need to repeat/i);
  assert.doesNotMatch(customer, /pay_demo_4821/);

  assert.match(support, /pay_demo_4821/);
  assert.match(support, /What exactly we need/i);
  assert.match(engineering, /duplicate-safe recovery action/i);
  assert.match(engineering, /No diagnosis is asserted/i);
});

test("warns on common credential and full-card patterns", () => {
  assert.equal(containsSensitiveData("access token: abc123"), true);
  assert.equal(containsSensitiveData("4111 1111 1111 1111"), true);
  assert.equal(containsSensitiveData("sandbox reference pay_demo_4821"), false);
});
