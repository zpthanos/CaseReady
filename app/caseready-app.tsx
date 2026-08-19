"use client";

import {
  type ChangeEvent,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  buildOutputs,
  CASE_READY_VERSION,
  containsSensitiveData,
  createEmptyCase,
  deadlineLabels,
  missingFields,
  outputToMarkdown,
  scenarios,
  scopeLabels,
  severityOptions,
  statusLabels,
  suggestSeverity,
  type CaseData,
  type CaseOutput,
} from "./lib/engine.mjs";

type FieldOption = { value: string; label: string };
type FieldDefinition = {
  name: string;
  label: string;
  help?: string;
  kind?: "input" | "textarea" | "select";
  optional?: boolean;
  options?: FieldOption[];
  rows?: number;
};

type StageDefinition = {
  label: string;
  title: string;
  introduction: string;
  fields: FieldDefinition[];
};

const stages: StageDefinition[] = [
  {
    label: "Objective",
    title: "Start with the customer’s objective",
    introduction:
      "An error code cannot explain what the customer was trying to finish or why it matters.",
    fields: [
      {
        name: "customerName",
        label: "Customer’s name",
        help: "Use the name they expect you to use in an update.",
      },
      {
        name: "organisation",
        label: "Organisation or account",
      },
      {
        name: "customerReference",
        label: "Existing case reference",
        help: "Leave blank if the support system has not assigned one.",
        optional: true,
      },
      {
        name: "objective",
        label: "Tell us what the customer was trying to complete.",
        kind: "textarea",
        rows: 3,
      },
      {
        name: "desiredOutcome",
        label: "What would a useful outcome look like now?",
        kind: "textarea",
        rows: 3,
      },
      {
        name: "impact",
        label: "What is the business impact?",
        help: "Describe blocked work, time pressure and who is affected.",
        kind: "textarea",
        rows: 3,
      },
      {
        name: "scope",
        label: "How broad is the impact?",
        kind: "select",
        options: Object.entries(scopeLabels).map(([value, label]) => ({
          value,
          label,
        })),
      },
    ],
  },
  {
    label: "Behaviour",
    title: "Describe the behaviour without diagnosing it",
    introduction:
      "Record what the customer can observe, what should happen and the shortest reliable way to see the difference.",
    fields: [
      {
        name: "problemSummary",
        label: "Summarise the problem in one factual sentence.",
        kind: "textarea",
        rows: 2,
      },
      {
        name: "firstSeen",
        label: "When was it first noticed?",
        optional: true,
      },
      {
        name: "lastWorking",
        label: "When did it last work as expected?",
        optional: true,
      },
      {
        name: "changedBefore",
        label: "What changed immediately before the problem appeared?",
        help: "A nearby change is context, not proof of a cause.",
        kind: "textarea",
        rows: 3,
      },
      {
        name: "steps",
        label: "What are the shortest reproduction steps?",
        kind: "textarea",
        rows: 4,
      },
      {
        name: "expected",
        label: "What should happen?",
        kind: "textarea",
        rows: 2,
      },
      {
        name: "actual",
        label: "What happens instead?",
        kind: "textarea",
        rows: 2,
      },
    ],
  },
  {
    label: "Context",
    title: "Establish the operating context",
    introduction:
      "Give the next person enough context to reproduce the report without asking the customer to begin again.",
    fields: [
      {
        name: "environment",
        label: "Environment, account, device and browser",
        kind: "textarea",
        rows: 3,
      },
      {
        name: "serviceStatus",
        label: "Current service behaviour",
        kind: "select",
        options: Object.entries(statusLabels).map(([value, label]) => ({
          value,
          label,
        })),
      },
      {
        name: "frequency",
        label: "How often does it happen?",
      },
      {
        name: "workaround",
        label: "Is there a safe workaround?",
        kind: "select",
        options: [
          { value: "unknown", label: "Not established" },
          { value: "yes", label: "Yes" },
          { value: "no", label: "No" },
        ],
      },
      {
        name: "deadline",
        label: "How urgent is the customer’s task?",
        kind: "select",
        options: Object.entries(deadlineLabels).map(([value, label]) => ({
          value,
          label,
        })),
      },
    ],
  },
  {
    label: "Evidence",
    title: "Record evidence, not guesses",
    introduction:
      "Keep the useful observations together and leave credentials, full payment details and private customer records out.",
    fields: [
      {
        name: "evidence",
        label: "What evidence is available?",
        help: "Name the evidence and its timestamp. Do not paste credentials.",
        kind: "textarea",
        rows: 4,
      },
      {
        name: "errorMessage",
        label: "Exact error or message",
        optional: true,
        kind: "textarea",
        rows: 2,
      },
      {
        name: "tried",
        label: "What have you already tried?",
        kind: "textarea",
        rows: 4,
      },
      {
        name: "attemptResults",
        label: "What did those checks prove or rule out?",
        kind: "textarea",
        rows: 3,
      },
    ],
  },
  {
    label: "Handoff",
    title: "Make ownership and the next request explicit",
    introduction:
      "A useful handoff says who owns the customer relationship and what the next team must return.",
    fields: [
      {
        name: "owner",
        label: "Who owns the customer follow-up?",
      },
      {
        name: "promised",
        label: "What have we promised the customer?",
        kind: "textarea",
        rows: 3,
      },
      {
        name: "nextUpdate",
        label: "When is the next customer update due?",
      },
      {
        name: "nextTeam",
        label: "Which team or provider receives the handoff?",
      },
      {
        name: "exactNeed",
        label: "What exactly do we need from the next team?",
        kind: "textarea",
        rows: 4,
      },
      {
        name: "severity",
        label: "Working severity",
        help: "The suggestion uses the current impact and urgency answers. Change it if your organisation’s policy requires a different level.",
        kind: "select",
        options: severityOptions,
      },
    ],
  },
];

const outputLabels: Record<string, string> = {
  intake: "Completed intake",
  customer: "Customer confirmation",
  support: "Support brief",
  engineering: "Engineering escalation",
};

function downloadText(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function Brand() {
  return (
    <a className="brand" href="#" aria-label="CaseReady home">
      <span className="brand-mark" aria-hidden="true">
        <span />
        <span />
      </span>
      <span className="brand-name">CaseReady</span>
    </a>
  );
}

function PrivacyIndicator() {
  return (
    <div className="privacy-indicator" aria-label="Privacy model">
      <span className="privacy-dot" aria-hidden="true" />
      <span>
        <strong>Local to this browser</strong>
        <small>Nothing is sent or saved automatically</small>
      </span>
    </div>
  );
}

function SiteHeader({
  started,
  onHome,
}: {
  started: boolean;
  onHome: () => void;
}) {
  return (
    <header className="site-header">
      <div className="header-inner">
        <Brand />
        <div className={`header-meta${started ? " is-started" : ""}`}>
          <span>Guided support intake</span>
          <a
            className="header-link"
            href="https://zpthanos.github.io/zpthanos/"
          >
            Evidence Registry
          </a>
          {started ? (
            <button className="text-button" type="button" onClick={onHome}>
              Return to start
            </button>
          ) : null}
        </div>
      </div>
    </header>
  );
}

function Landing({
  onStartBlank,
  onScenario,
}: {
  onStartBlank: () => void;
  onScenario: (id: string) => void;
}) {
  return (
    <main id="main-content">
      <section className="hero shell">
        <div className="hero-copy">
          <p className="eyebrow">Support handoff workspace</p>
          <h1>Turn one careful intake into the right next message.</h1>
          <p className="hero-purpose">
            CaseReady guides a support conversation, then prepares a clear
            customer confirmation, an internal brief and a precise technical
            escalation from the same facts.
          </p>
          <div className="hero-actions">
            <button
              className="button button-primary"
              type="button"
              onClick={() => onScenario("payment-order-mismatch")}
            >
              Open the payment incident demo
            </button>
            <button
              className="button button-quiet"
              type="button"
              onClick={onStartBlank}
            >
              Start a blank case
            </button>
          </div>
          <p className="hero-note">
            The demonstration data is fictional and editable. No account,
            backend or automatic draft storage.
          </p>
        </div>
        <aside className="output-map" aria-label="Outputs prepared by CaseReady">
          <p className="output-map-label">One conversation, different readers</p>
          <div className="output-map-row customer-row">
            <span>Customer</span>
            <strong>Ownership and next update</strong>
          </div>
          <div className="output-map-row support-row">
            <span>Support</span>
            <strong>Context, evidence and commitments</strong>
          </div>
          <div className="output-map-row engineering-row">
            <span>Resolver</span>
            <strong>Reproduction and exact request</strong>
          </div>
        </aside>
      </section>

      <section className="scenario-section shell" id="practice-cases">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Fictional practice cases</p>
            <h2>See the full workflow with safe demonstration data.</h2>
          </div>
          <p>
            Every name, organisation, reference and incident below is
            fictional. Each scenario can be edited before generating outputs.
          </p>
        </div>
        <div className="scenario-list">
          {scenarios.map((scenario, index) => (
            <button
              className="scenario-row"
              type="button"
              key={scenario.id}
              onClick={() => onScenario(scenario.id)}
            >
              <span className="scenario-number">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="scenario-copy">
                <strong>{scenario.title}</strong>
                <small>{scenario.description}</small>
              </span>
              <span className="scenario-action">Open case</span>
            </button>
          ))}
        </div>
      </section>

      <section className="principle">
        <div className="principle-grid shell">
          <p>
            CaseReady begins with “What were you trying to complete?” because a
            technical symptom without the customer’s objective is not yet a
            useful case.
          </p>
          <a
            className="registry-bridge"
            href="https://zpthanos.github.io/zpthanos/"
          >
            <span>Evidence behind the approach</span>
            <strong>Open the Client Evidence Registry</strong>
          </a>
        </div>
      </section>
    </main>
  );
}

function FormField({
  field,
  value,
  invalid,
  onChange,
}: {
  field: FieldDefinition;
  value: string;
  invalid: boolean;
  onChange: (name: string, value: string) => void;
}) {
  const id = "field-" + field.name;
  const helpId = field.help ? id + "-help" : undefined;
  const errorId = invalid ? id + "-error" : undefined;
  const describedBy = [helpId, errorId].filter(Boolean).join(" ") || undefined;
  const common = {
    id,
    name: field.name,
    value,
    "aria-invalid": invalid,
    "aria-describedby": describedBy,
    onChange: (
      event: ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) => onChange(field.name, event.target.value),
  };

  return (
    <div className={"field " + (invalid ? "field-invalid" : "")}>
      <label htmlFor={id}>
        {field.label}
        {field.optional ? <span className="optional">Optional</span> : null}
      </label>
      {field.help ? (
        <p className="field-help" id={helpId}>
          {field.help}
        </p>
      ) : null}
      {field.kind === "textarea" ? (
        <textarea {...common} rows={field.rows ?? 3} />
      ) : field.kind === "select" ? (
        <select {...common}>
          {field.options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input {...common} type="text" />
      )}
      {invalid ? (
        <p className="field-error" id={errorId}>
          Add this detail before continuing.
        </p>
      ) : null}
    </div>
  );
}

function IntakeSummary({ caseData }: { caseData: CaseData }) {
  const groups = [
    {
      title: "Customer objective",
      items: [
        ["Customer", caseData.customerName + " · " + caseData.organisation],
        ["Trying to complete", caseData.objective],
        ["Useful outcome", caseData.desiredOutcome],
        ["Business impact", caseData.impact],
      ],
    },
    {
      title: "Observed behaviour",
      items: [
        ["Case summary", caseData.problemSummary],
        ["Expected", caseData.expected],
        ["Actual", caseData.actual],
        ["Changed beforehand", caseData.changedBefore],
      ],
    },
    {
      title: "Evidence and handoff",
      items: [
        ["Evidence", caseData.evidence],
        ["Already tried", caseData.tried],
        ["Owner", caseData.owner],
        ["Next team", caseData.nextTeam],
        ["Exact request", caseData.exactNeed],
      ],
    },
  ];

  return (
    <article className="intake-summary">
      <div className="document-heading">
        <p className="eyebrow">Completed intake</p>
        <h2>{caseData.problemSummary}</h2>
        <p>
          Reference {caseData.customerReference || "not assigned"} · Working
          severity {caseData.severity || suggestSeverity(caseData)}
        </p>
      </div>
      <div className="intake-groups">
        {groups.map((group) => (
          <section key={group.title}>
            <h3>{group.title}</h3>
            <dl>
              {group.items.map(([term, description]) => (
                <div key={term}>
                  <dt>{term}</dt>
                  <dd>{description || "Not supplied"}</dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>
    </article>
  );
}

function OutputDocument({ output }: { output: CaseOutput }) {
  return (
    <article className={"output-document output-" + output.kind}>
      <div className="document-heading">
        <p className="eyebrow">{output.eyebrow}</p>
        <h2>{output.title}</h2>
        <p>{output.introduction}</p>
      </div>
      <div className="document-sections">
        {output.sections.map((section) => (
          <section key={section.heading}>
            <h3>{section.heading}</h3>
            <ul>
              {section.lines.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </section>
        ))}
      </div>
      <footer>{output.footer}</footer>
    </article>
  );
}

function Workspace({
  caseData,
  setCaseData,
  onReset,
}: {
  caseData: CaseData;
  setCaseData: (caseData: CaseData) => void;
  onReset: () => void;
}) {
  const [stage, setStage] = useState(0);
  const [mode, setMode] = useState<"form" | "outputs">("form");
  const [activeOutput, setActiveOutput] = useState("intake");
  const [errors, setErrors] = useState<string[]>([]);
  const [status, setStatus] = useState("");
  const [severityTouched, setSeverityTouched] = useState(
    Boolean(caseData.severity),
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const outputs = useMemo(() => buildOutputs(caseData), [caseData]);
  const sensitiveText = [
    caseData.evidence,
    caseData.errorMessage,
    caseData.tried,
    caseData.attemptResults,
  ].join(" ");
  const hasSensitiveData = containsSensitiveData(sensitiveText);

  function updateField(name: string, value: string) {
    const next = { ...caseData, [name]: value };
    if (name === "severity") {
      setSeverityTouched(true);
    } else if (
      !severityTouched &&
      ["scope", "serviceStatus", "workaround", "deadline"].includes(name)
    ) {
      next.severity = suggestSeverity(next);
    }
    setCaseData(next);
    setErrors((current) => current.filter((field) => field !== name));
    setStatus("");
  }

  function moveForward() {
    const missing = missingFields(caseData, stage);
    if (missing.length) {
      setErrors(missing);
      setStatus(
        "Complete " +
          missing.length +
          " highlighted " +
          (missing.length === 1 ? "answer" : "answers") +
          " before continuing.",
      );
      document.querySelector<HTMLElement>("[aria-invalid='true']")?.focus();
      return;
    }
    if (hasSensitiveData && stage === 3) {
      setStatus(
        "Remove possible credentials or full payment details before continuing.",
      );
      return;
    }
    if (stage === stages.length - 1) {
      const next = {
        ...caseData,
        severity: caseData.severity || suggestSeverity(caseData),
      };
      setCaseData(next);
      setActiveOutput("intake");
      setMode("outputs");
      setStatus("Outputs generated from the completed intake.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setStage((current) => current + 1);
    setErrors([]);
    setStatus("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function moveBack() {
    if (mode === "outputs") {
      setMode("form");
      setStage(stages.length - 1);
      setStatus("");
      return;
    }
    setStage((current) => Math.max(0, current - 1));
    setErrors([]);
    setStatus("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function saveCase() {
    downloadText(
      "caseready-case.json",
      JSON.stringify(
        {
          format: "CaseReady",
          version: CASE_READY_VERSION,
          savedAt: new Date().toISOString(),
          case: caseData,
        },
        null,
        2,
      ),
      "application/json",
    );
    setStatus("Case file downloaded to this device.");
  }

  async function openCase(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text()) as {
        format?: string;
        case?: CaseData;
      };
      if (parsed.format !== "CaseReady" || !parsed.case) {
        throw new Error("Unexpected file format");
      }
      const next = { ...createEmptyCase(), ...parsed.case };
      setCaseData(next);
      setSeverityTouched(Boolean(next.severity));
      setStage(0);
      setMode("form");
      setErrors([]);
      setStatus("Case file opened. Review the answers before continuing.");
    } catch {
      setStatus("This file could not be opened as a CaseReady case.");
    } finally {
      event.target.value = "";
    }
  }

  async function copyOutput() {
    if (activeOutput === "intake") return;
    const output = outputs[activeOutput as keyof typeof outputs];
    try {
      await navigator.clipboard.writeText(outputToMarkdown(output));
      setStatus(outputLabels[activeOutput] + " copied.");
    } catch {
      setStatus(
        "Copy was blocked by the browser. Download the Markdown file instead.",
      );
    }
  }

  function downloadOutput() {
    if (activeOutput === "intake") return;
    const output = outputs[activeOutput as keyof typeof outputs];
    const filename =
      (caseData.scenarioId || "case") + "-" + activeOutput + ".md";
    downloadText(filename, outputToMarkdown(output), "text/markdown");
    setStatus(outputLabels[activeOutput] + " downloaded.");
  }

  const stageDefinition = stages[stage];
  const suggestedSeverity = suggestSeverity(caseData);
  const currentOutput =
    activeOutput === "intake"
      ? null
      : outputs[activeOutput as keyof typeof outputs];

  return (
    <main id="main-content" className="workspace shell">
      <div className="workspace-topline">
        <div>
          <p className="case-reference">
            {caseData.scenarioLabel || "New support case"}
          </p>
          <p className="save-model">Draft changes stay only in this tab.</p>
        </div>
        <div className="workspace-tools">
          <button className="text-button" type="button" onClick={saveCase}>
            Download case file
          </button>
          <button
            className="text-button"
            type="button"
            onClick={() => fileInputRef.current?.click()}
          >
            Open case file
          </button>
          <input
            ref={fileInputRef}
            className="visually-hidden"
            type="file"
            accept="application/json,.json"
            onChange={openCase}
          />
          <button className="text-button danger" type="button" onClick={onReset}>
            Clear case
          </button>
        </div>
      </div>

      {mode === "form" ? (
        <>
          <nav className="progress" aria-label="Case intake progress">
            <div className="progress-copy">
              <span>
                Stage {stage + 1} of {stages.length}
              </span>
              <strong>{stageDefinition.label}</strong>
            </div>
            <div className="progress-track" aria-hidden="true">
              {stages.map((item, index) => (
                <span
                  className={
                    index < stage
                      ? "complete"
                      : index === stage
                        ? "current"
                        : ""
                  }
                  key={item.label}
                />
              ))}
            </div>
          </nav>

          <div className="form-layout">
            <aside className="stage-context">
              <p className="eyebrow">{stageDefinition.label}</p>
              <h1>{stageDefinition.title}</h1>
              <p>{stageDefinition.introduction}</p>
              {stage === 3 ? (
                <div
                  className={
                    "sensitive-note " + (hasSensitiveData ? "detected" : "")
                  }
                  role={hasSensitiveData ? "alert" : undefined}
                >
                  <strong>
                    {hasSensitiveData
                      ? "Possible sensitive data detected"
                      : "Keep sensitive data out"}
                  </strong>
                  <p>
                    Never include passwords, access tokens, private keys or full
                    payment-card numbers. Replace them with a safe reference.
                  </p>
                </div>
              ) : null}
              {stage === 4 ? (
                <div className="severity-note">
                  <span>Current suggestion</span>
                  <strong>{suggestedSeverity}</strong>
                  <p>
                    Based on the impact, scope, service status and available
                    workaround entered so far.
                  </p>
                </div>
              ) : null}
            </aside>

            <section className="form-panel" aria-labelledby="stage-title">
              <h2 className="visually-hidden" id="stage-title">
                {stageDefinition.title}
              </h2>
              {status ? (
                <div
                  className={
                    status.startsWith("Complete") ||
                    status.startsWith("Remove")
                      ? "form-alert error"
                      : "form-alert"
                  }
                  role="status"
                >
                  {status}
                </div>
              ) : null}
              <div className="field-list">
                {stageDefinition.fields.map((field) => (
                  <FormField
                    key={field.name}
                    field={field}
                    value={
                      field.name === "severity" && !caseData.severity
                        ? suggestedSeverity
                        : caseData[field.name] || ""
                    }
                    invalid={errors.includes(field.name)}
                    onChange={updateField}
                  />
                ))}
              </div>
              <div className="form-actions">
                <button
                  className="button button-quiet"
                  type="button"
                  onClick={moveBack}
                  disabled={stage === 0}
                >
                  Back
                </button>
                <button
                  className="button button-primary"
                  type="button"
                  onClick={moveForward}
                >
                  {stage === stages.length - 1
                    ? "Generate case outputs"
                    : "Continue"}
                </button>
              </div>
            </section>
          </div>
        </>
      ) : (
        <section className="outputs-workspace">
          <div className="outputs-heading">
            <div>
              <p className="eyebrow">Case prepared</p>
              <h1>Same facts, written for the person receiving them.</h1>
              <p>
                Review every output before sending it. CaseReady does not
                diagnose the problem or make a customer commitment for you.
              </p>
            </div>
            <button
              className="button button-quiet"
              type="button"
              onClick={moveBack}
            >
              Edit handoff
            </button>
          </div>

          <div className="output-tabs" role="tablist" aria-label="Case outputs">
            {Object.entries(outputLabels).map(([key, label]) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={activeOutput === key}
                className={activeOutput === key ? "active" : ""}
                onClick={() => {
                  setActiveOutput(key);
                  setStatus("");
                }}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="output-toolbar">
            <span>{outputLabels[activeOutput]}</span>
            {activeOutput !== "intake" ? (
              <div>
                <button
                  className="text-button"
                  type="button"
                  onClick={copyOutput}
                >
                  Copy Markdown
                </button>
                <button
                  className="text-button"
                  type="button"
                  onClick={downloadOutput}
                >
                  Download .md
                </button>
              </div>
            ) : null}
          </div>

          {status ? (
            <div className="output-status" role="status">
              {status}
            </div>
          ) : null}

          {activeOutput === "intake" ? (
            <IntakeSummary caseData={caseData} />
          ) : currentOutput ? (
            <OutputDocument output={currentOutput} />
          ) : null}
        </section>
      )}
    </main>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="shell">
        <div>
          <strong>CaseReady</strong>
          <p>Guided support intake with deterministic, reviewable outputs.</p>
        </div>
        <div className="footer-meta">
          <nav className="footer-links" aria-label="Related work">
            <a href="https://zpthanos.github.io/zpthanos/">
              Evidence Registry
            </a>
            <a href="https://github.com/zpthanos/CaseReady">Source</a>
          </nav>
          <p>
            Designed and authored by Athanasios Zaprios · Version{" "}
            {CASE_READY_VERSION}
          </p>
        </div>
      </div>
    </footer>
  );
}

export default function CaseReadyApp() {
  const [started, setStarted] = useState(false);
  const [caseData, setCaseData] = useState<CaseData>(createEmptyCase());

  function startBlank() {
    setCaseData(createEmptyCase());
    setStarted(true);
    window.scrollTo({ top: 0 });
  }

  function startScenario(id: string) {
    const scenario = scenarios.find((item) => item.id === id);
    if (!scenario) return;
    setCaseData({ ...createEmptyCase(), ...scenario.caseData });
    setStarted(true);
    window.scrollTo({ top: 0 });
  }

  function resetCase() {
    if (
      window.confirm(
        "Clear this case? Unsaved answers in this tab cannot be recovered.",
      )
    ) {
      setCaseData(createEmptyCase());
      setStarted(false);
      window.scrollTo({ top: 0 });
    }
  }

  function returnHome() {
    if (
      !started ||
      window.confirm(
        "Return to the start? Download the case first if you need these answers.",
      )
    ) {
      setStarted(false);
      setCaseData(createEmptyCase());
      window.scrollTo({ top: 0 });
    }
  }

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      <SiteHeader started={started} onHome={returnHome} />
      <PrivacyIndicator />
      {started ? (
        <Workspace
          caseData={caseData}
          setCaseData={setCaseData}
          onReset={resetCase}
        />
      ) : (
        <Landing onStartBlank={startBlank} onScenario={startScenario} />
      )}
      <Footer />
    </div>
  );
}
