export type SupLabels = {
  sup: string;
  SUPLE: string;
};

const EXTRA_TIME_TYPES = new Set<string>([
  "round-of-16-extra",
  "quarterfinal-extra",
  "semifinal-extra",
  "final-extra",
]);

export function getSupLabels(matchType: string | undefined | null): SupLabels {
  if (matchType && EXTRA_TIME_TYPES.has(matchType)) {
    return {
      sup: " (sup.)",
      SUPLE: " SUPLEMENTARIO",
    };
  }
  return { sup: "", SUPLE: "" };
}

export function isExtraTime(matchType: string | undefined | null): boolean {
  return !!matchType && EXTRA_TIME_TYPES.has(matchType);
}
