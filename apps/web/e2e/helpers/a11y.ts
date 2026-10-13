type AxeAnalyzeResults = {
  violations: Array<{ impact?: string | null }>;
};

export function seriousAxeViolations(results: AxeAnalyzeResults) {
  return results.violations.filter(
    (v) => v.impact === "serious" || v.impact === "critical",
  );
}
