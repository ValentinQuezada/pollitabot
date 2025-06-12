export function getMatchFee(matchType: string, acertaronFinalRegular = false): number {
  if (matchType === "group-regular") return 5;
  if (matchType === "final-regular") return 20;
  if (matchType === "final-extra") return acertaronFinalRegular ? 10 : 20;
  return 10; // for all other match types
}