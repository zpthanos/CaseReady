export type CaseData = Record<string, string>;

export type OutputSection = {
  heading: string;
  lines: string[];
};

export type CaseOutput = {
  kind: "customer" | "support" | "engineering";
  eyebrow: string;
  title: string;
  introduction: string;
  sections: OutputSection[];
  footer: string;
};

export type Scenario = {
  id: string;
  title: string;
  description: string;
  caseData: CaseData;
};

export const CASE_READY_VERSION: string;
export const severityOptions: { value: string; label: string }[];
export const scopeLabels: Record<string, string>;
export const statusLabels: Record<string, string>;
export const deadlineLabels: Record<string, string>;
export const scenarios: Scenario[];
export const requiredByStage: string[][];

export function createEmptyCase(): CaseData;
export function getScenario(id: string): Scenario | null;
export function suggestSeverity(caseData: CaseData): string;
export function buildOutputs(caseData: CaseData): {
  customer: CaseOutput;
  support: CaseOutput;
  engineering: CaseOutput;
};
export function outputToMarkdown(output: CaseOutput): string;
export function fictionalArtifact(
  output: CaseOutput,
  scenarioTitle: string,
): string;
export function containsSensitiveData(value: string): boolean;
export function missingFields(caseData: CaseData, stageIndex: number): string[];
