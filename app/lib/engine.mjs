export const CASE_READY_VERSION = "1.0.1";

export const severityOptions = [
  { value: "S1", label: "S1 — critical interruption" },
  { value: "S2", label: "S2 — serious business impact" },
  { value: "S3", label: "S3 — limited impact" },
  { value: "S4", label: "S4 — low-impact request" },
];

export const scopeLabels = {
  all: "All users or a whole service",
  many: "Several users or a key workflow",
  single: "One user or one transaction",
  unclear: "Scope still unclear",
};

export const statusLabels = {
  unavailable: "Unavailable",
  degraded: "Available but degraded",
  intermittent: "Intermittent",
  incorrect: "Completes with an incorrect result",
  cosmetic: "Cosmetic or informational",
};

export const deadlineLabels = {
  blocking: "Work cannot continue",
  time_sensitive: "A time-sensitive task is at risk",
  none: "No immediate deadline",
};

export function createEmptyCase() {
  return {
    scenarioId: "",
    scenarioLabel: "",
    customerReference: "",
    customerName: "",
    organisation: "",
    objective: "",
    desiredOutcome: "",
    impact: "",
    scope: "unclear",
    problemSummary: "",
    firstSeen: "",
    lastWorking: "",
    changedBefore: "",
    steps: "",
    expected: "",
    actual: "",
    environment: "",
    serviceStatus: "degraded",
    frequency: "",
    workaround: "unknown",
    deadline: "none",
    evidence: "",
    errorMessage: "",
    tried: "",
    attemptResults: "",
    owner: "",
    promised: "",
    nextUpdate: "",
    nextTeam: "",
    exactNeed: "",
    severity: "",
  };
}

export const scenarios = [
  {
    id: "payment-order-mismatch",
    title: "Payment taken, order missing",
    description:
      "A sandbox payment is approved but the matching order is absent.",
    caseData: {
      scenarioId: "payment-order-mismatch",
      scenarioLabel: "Payment taken, order missing",
      customerReference: "CASE-DEMO-1042",
      customerName: "Mara",
      organisation: "Northstar Office Supplies (fictional)",
      objective:
        "complete a time-sensitive office-supply order and receive an order confirmation",
      desiredOutcome:
        "confirm whether the order exists and give the buyer a safe next action without risking a duplicate charge",
      impact:
        "one buyer has a successful sandbox payment but no order confirmation, so dispatch cannot begin",
      scope: "single",
      problemSummary:
        "The sandbox payment provider shows an approved payment, but the commerce system has no matching order.",
      firstSeen: "14:12 UTC today",
      lastWorking: "A sandbox order completed normally at 13:34 UTC today",
      changedBefore:
        "Checkout configuration was updated about 40 minutes before the report. No causal link has been confirmed.",
      steps:
        "Open the sandbox shop; add the blue desk chair; continue as a guest; submit the test payment; return to the confirmation page.",
      expected:
        "A confirmed order appears in the order list and the buyer receives an order reference.",
      actual:
        "The provider approves the sandbox payment, the confirmation page times out, and no order appears in the order list.",
      environment:
        "Sandbox shop, guest checkout, Chrome 128 on Windows 11",
      serviceStatus: "incorrect",
      frequency: "Reproduced twice with the same sandbox product",
      workaround: "no",
      deadline: "time_sensitive",
      evidence:
        "Sandbox payment reference pay_demo_4821; browser network export; screenshots at 14:18 UTC; order search showing no result.",
      errorMessage: "Checkout confirmation request returned HTTP 504.",
      tried:
        "Searched by payment reference and buyer email; retried the confirmation lookup; confirmed the payment remains sandbox-only.",
      attemptResults:
        "No matching order was found. The lookup retry returned the same timeout. No second payment was attempted.",
      owner: "Mina in Support",
      promised:
        "update the customer by 16:30 UTC, even if the investigation is still in progress",
      nextUpdate: "16:30 UTC today",
      nextTeam: "Commerce engineering",
      exactNeed:
        "Trace the sandbox payment callback and order-creation path for pay_demo_4821, then confirm the duplicate-safe recovery action.",
      severity: "S2",
    },
  },
  {
    id: "saas-permissions",
    title: "Workspace permission changed",
    description:
      "A reporting user lost access after an intentional role change.",
    caseData: {
      scenarioId: "saas-permissions",
      scenarioLabel: "Workspace permission changed",
      customerReference: "CASE-DEMO-2088",
      customerName: "Ilias",
      organisation: "OrbitDesk Analytics (fictional)",
      objective:
        "finish the month-end reporting pack for the finance review",
      desiredOutcome:
        "restore the intended report access or identify the exact permission the workspace owner must approve",
      impact:
        "one analyst cannot open the billing report needed for a review tomorrow morning",
      scope: "single",
      problemSummary:
        "The analyst can sign in but receives an access-denied message on one billing report.",
      firstSeen: "09:05 UTC today",
      lastWorking: "The report opened normally yesterday at 16:40 UTC",
      changedBefore:
        "The workspace owner changed the analyst from Admin to Analyst yesterday evening.",
      steps:
        "Sign in as the demonstration analyst; open Finance workspace; choose Reports; open Monthly billing.",
      expected: "The Monthly billing report opens in read-only mode.",
      actual:
        "The report page shows that the current role does not have permission.",
      environment: "Demonstration tenant, Chrome 128 on macOS 15",
      serviceStatus: "degraded",
      frequency: "Every attempt with the demonstration analyst",
      workaround: "no",
      deadline: "time_sensitive",
      evidence:
        "Role audit entry at 18:22 UTC yesterday; access-denied screenshot; report ID rpt_demo_72.",
      errorMessage: "You do not have permission to view this report.",
      tried:
        "Signed out and back in; confirmed access to two non-finance reports; asked the owner to verify the intended Analyst role.",
      attemptResults:
        "The session refresh did not change access. Other reports work, which narrows the problem to report permissions.",
      owner: "Ari in Customer Support",
      promised:
        "confirm the required permission before asking the workspace owner to make another change",
      nextUpdate: "12:00 UTC today",
      nextTeam: "Workspace permissions team",
      exactNeed:
        "Confirm whether read-only billing-report access is included in the Analyst role for rpt_demo_72 and identify the smallest safe permission change.",
      severity: "S3",
    },
  },
  {
    id: "dns-tls-incident",
    title: "Domain shows a certificate warning",
    description:
      "A fictional learning portal is blocked by a TLS warning after a DNS change.",
    caseData: {
      scenarioId: "dns-tls-incident",
      scenarioLabel: "Domain shows a certificate warning",
      customerReference: "CASE-DEMO-3174",
      customerName: "Nadia",
      organisation: "Harborlight Learning (fictional)",
      objective:
        "open the learner portal so the afternoon enrolment session can begin",
      desiredOutcome:
        "restore trusted access to the portal and confirm what the customer should expect while DNS changes propagate",
      impact:
        "all demonstration users see a browser certificate warning and cannot safely continue to the portal",
      scope: "all",
      problemSummary:
        "The portal domain presents a certificate-name warning after its DNS record was changed.",
      firstSeen: "10:18 UTC today",
      lastWorking: "The portal loaded normally at 09:42 UTC today",
      changedBefore:
        "The DNS CNAME was changed from the old hosting target to the new edge target at 09:55 UTC.",
      steps:
        "Open the demonstration portal URL in a private browser window from either test network.",
      expected:
        "The portal loads over HTTPS with a trusted certificate for the portal hostname.",
      actual:
        "The browser blocks the page because the certificate does not include the requested hostname.",
      environment:
        "Demonstration domain, Chrome 128 and Safari 18, two test networks",
      serviceStatus: "unavailable",
      frequency: "Every attempt from both test networks",
      workaround: "no",
      deadline: "blocking",
      evidence:
        "DNS lookup output from both networks; certificate subject and SAN capture; timestamped browser screenshots.",
      errorMessage: "NET::ERR_CERT_COMMON_NAME_INVALID",
      tried:
        "Confirmed the current DNS answer; checked the certificate hostname; tested from a second network; did not bypass the browser warning.",
      attemptResults:
        "Both networks resolve to the new target. The served certificate still names the provider hostname rather than the portal hostname.",
      owner: "Theo in Technical Support",
      promised:
        "provide the next status update in 30 minutes and advise whether the enrolment session needs an alternative",
      nextUpdate: "10:55 UTC today",
      nextTeam: "Hosting and DNS provider",
      exactNeed:
        "Confirm custom-hostname activation for the demonstration domain, issue the matching certificate, and provide a safe rollback point if activation cannot complete before the customer update.",
      severity: "S1",
    },
  },
];

export function getScenario(id) {
  return scenarios.find((scenario) => scenario.id === id) ?? null;
}

export function suggestSeverity(caseData) {
  const noWorkaround = caseData.workaround === "no";
  const broadScope = caseData.scope === "all" || caseData.scope === "many";
  const workBlocked = caseData.deadline === "blocking";

  if (
    caseData.serviceStatus === "unavailable" &&
    caseData.scope === "all" &&
    noWorkaround
  ) {
    return "S1";
  }

  if (
    (caseData.serviceStatus === "unavailable" && (broadScope || workBlocked)) ||
    (broadScope && noWorkaround && workBlocked) ||
    (caseData.serviceStatus === "incorrect" &&
      noWorkaround &&
      caseData.deadline !== "none")
  ) {
    return "S2";
  }

  if (
    caseData.scope === "single" ||
    caseData.serviceStatus === "degraded" ||
    caseData.serviceStatus === "intermittent" ||
    caseData.deadline === "time_sensitive"
  ) {
    return "S3";
  }

  return "S4";
}

function valueOrNotSupplied(value) {
  return value && String(value).trim() ? String(value).trim() : "Not supplied";
}

function titleCaseSeverity(caseData) {
  const severity = caseData.severity || suggestSeverity(caseData);
  return (
    severityOptions.find((option) => option.value === severity)?.label ??
    severity
  );
}

function section(heading, lines) {
  return {
    heading,
    lines: lines.filter((line) => line && String(line).trim()),
  };
}

export function buildOutputs(caseData) {
  const severity = caseData.severity || suggestSeverity(caseData);
  const customer = {
    kind: "customer",
    eyebrow: "Customer confirmation",
    title: "We have recorded what happened",
    introduction:
      "Thank you, " +
      valueOrNotSupplied(caseData.customerName) +
      ". We understand you were trying to " +
      valueOrNotSupplied(caseData.objective) +
      ".",
    sections: [
      section("What we have understood", [
        "Instead: " + valueOrNotSupplied(caseData.actual),
        "Impact: " + valueOrNotSupplied(caseData.impact),
        "What changed beforehand: " +
          valueOrNotSupplied(caseData.changedBefore),
      ]),
      section("What happens next", [
        valueOrNotSupplied(caseData.owner) + " owns the follow-up.",
        "We have promised to " + valueOrNotSupplied(caseData.promised) + ".",
        "Your next update is due " +
          valueOrNotSupplied(caseData.nextUpdate) +
          ".",
      ]),
      section("You do not need to repeat", [
        "We have recorded what you already tried: " +
          valueOrNotSupplied(caseData.tried),
        "If another item is needed, we will ask for it specifically.",
      ]),
    ],
    footer:
      "Reference " +
      valueOrNotSupplied(caseData.customerReference) +
      " · This confirmation records the case; it does not claim a diagnosis.",
  };

  const support = {
    kind: "support",
    eyebrow: "Internal support brief",
    title: valueOrNotSupplied(caseData.problemSummary),
    introduction:
      valueOrNotSupplied(caseData.customerName) +
      " at " +
      valueOrNotSupplied(caseData.organisation) +
      " is trying to " +
      valueOrNotSupplied(caseData.objective) +
      ".",
    sections: [
      section("Customer outcome and impact", [
        "Desired outcome: " + valueOrNotSupplied(caseData.desiredOutcome),
        "Business impact: " + valueOrNotSupplied(caseData.impact),
        "Scope: " + (scopeLabels[caseData.scope] ?? caseData.scope),
        "Time pressure: " +
          (deadlineLabels[caseData.deadline] ?? caseData.deadline),
        "Safe workaround: " +
          (caseData.workaround === "yes"
            ? "Available"
            : caseData.workaround === "no"
              ? "Not available"
              : "Not established"),
        "Severity: " + titleCaseSeverity({ ...caseData, severity }),
      ]),
      section("Observed behaviour", [
        "Expected: " + valueOrNotSupplied(caseData.expected),
        "Actual: " + valueOrNotSupplied(caseData.actual),
        "Frequency: " + valueOrNotSupplied(caseData.frequency),
        "Status: " +
          (statusLabels[caseData.serviceStatus] ?? caseData.serviceStatus),
      ]),
      section("Timeline and context", [
        "First seen: " + valueOrNotSupplied(caseData.firstSeen),
        "Last known working: " + valueOrNotSupplied(caseData.lastWorking),
        "Changed immediately before: " +
          valueOrNotSupplied(caseData.changedBefore),
        "Environment: " + valueOrNotSupplied(caseData.environment),
      ]),
      section("Reproduction", [
        valueOrNotSupplied(caseData.steps),
        "Message: " + valueOrNotSupplied(caseData.errorMessage),
      ]),
      section("Work already completed", [
        "Tried: " + valueOrNotSupplied(caseData.tried),
        "Result: " + valueOrNotSupplied(caseData.attemptResults),
        "Evidence: " + valueOrNotSupplied(caseData.evidence),
      ]),
      section("Ownership and commitment", [
        "Owner: " + valueOrNotSupplied(caseData.owner),
        "Customer promise: " + valueOrNotSupplied(caseData.promised),
        "Next update: " + valueOrNotSupplied(caseData.nextUpdate),
      ]),
      section("Handoff", [
        "Next team: " + valueOrNotSupplied(caseData.nextTeam),
        "What exactly we need: " + valueOrNotSupplied(caseData.exactNeed),
      ]),
    ],
    footer:
      "Reference " +
      valueOrNotSupplied(caseData.customerReference) +
      " · Suggested severity remains an operator decision.",
  };

  const engineering = {
    kind: "engineering",
    eyebrow: "Engineering escalation",
    title:
      "Request to " +
      valueOrNotSupplied(caseData.nextTeam) +
      ": " +
      valueOrNotSupplied(caseData.exactNeed),
    introduction:
      valueOrNotSupplied(caseData.problemSummary) +
      " No diagnosis is asserted in this escalation.",
    sections: [
      section("Required outcome", [
        valueOrNotSupplied(caseData.desiredOutcome),
        "Customer objective: " + valueOrNotSupplied(caseData.objective),
      ]),
      section("Observed versus expected", [
        "Expected: " + valueOrNotSupplied(caseData.expected),
        "Observed: " + valueOrNotSupplied(caseData.actual),
        "Error or message: " + valueOrNotSupplied(caseData.errorMessage),
      ]),
      section("Reproduction and environment", [
        "Steps: " + valueOrNotSupplied(caseData.steps),
        "Environment: " + valueOrNotSupplied(caseData.environment),
        "Frequency: " + valueOrNotSupplied(caseData.frequency),
      ]),
      section("Change and evidence", [
        "Changed beforehand: " +
          valueOrNotSupplied(caseData.changedBefore),
        "Evidence available: " + valueOrNotSupplied(caseData.evidence),
      ]),
      section("Checks already made", [
        valueOrNotSupplied(caseData.tried),
        "Results: " + valueOrNotSupplied(caseData.attemptResults),
      ]),
      section("Impact and communication boundary", [
        "Impact: " + valueOrNotSupplied(caseData.impact),
        "Time pressure: " +
          (deadlineLabels[caseData.deadline] ?? caseData.deadline),
        "Safe workaround: " +
          (caseData.workaround === "yes"
            ? "Available"
            : caseData.workaround === "no"
              ? "Not available"
              : "Not established"),
        "Severity: " + titleCaseSeverity({ ...caseData, severity }),
        "What support promised: " + valueOrNotSupplied(caseData.promised),
        "Next customer update: " + valueOrNotSupplied(caseData.nextUpdate),
      ]),
    ],
    footer:
      "Reference " +
      valueOrNotSupplied(caseData.customerReference) +
      " · Please return a finding, a safe next action, and any evidence still required.",
  };

  return { customer, support, engineering };
}

export function outputToMarkdown(output) {
  const lines = [
    "# " + output.eyebrow,
    "",
    "## " + output.title,
    "",
    output.introduction,
    "",
  ];

  for (const current of output.sections) {
    lines.push("### " + current.heading, "");
    for (const line of current.lines) {
      lines.push("- " + line);
    }
    lines.push("");
  }

  lines.push("---", "", output.footer, "");
  return lines.join("\n");
}

export function fictionalArtifact(output, scenarioTitle) {
  return (
    "> Fictional demonstration scenario generated by CaseReady " +
    CASE_READY_VERSION +
    ". No real customer, organisation, account or incident is represented.\n\n" +
    "Scenario: **" +
    scenarioTitle +
    "**\n\n" +
    outputToMarkdown(output)
  );
}

export function containsSensitiveData(value) {
  const text = String(value || "");
  const credentialPattern =
    /\b(password|passphrase|api[\s_-]?key|access[\s_-]?token|secret|private[\s_-]?key)\b/i;
  const cardPattern = /(?:\d[ -]*?){13,19}/;
  const privateKeyPattern = /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/;
  return (
    credentialPattern.test(text) ||
    cardPattern.test(text) ||
    privateKeyPattern.test(text)
  );
}

export const requiredByStage = [
  ["customerName", "organisation", "objective", "desiredOutcome", "impact"],
  ["problemSummary", "changedBefore", "steps", "expected", "actual"],
  ["environment", "frequency"],
  ["evidence", "tried", "attemptResults"],
  ["owner", "promised", "nextUpdate", "nextTeam", "exactNeed"],
];

export function missingFields(caseData, stageIndex) {
  return (requiredByStage[stageIndex] ?? []).filter(
    (field) => !String(caseData[field] ?? "").trim(),
  );
}
