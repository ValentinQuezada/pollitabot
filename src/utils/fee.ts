export function getMatchFee(matchType: string, acertaron = true): number {
  // console.log(`Calculating fee for match type: ${matchType}`);
  if (matchType === "group-regular") return 5;
  if (matchType === "round-of-16-extra"
    || matchType === "quarterfinal-extra"
    || matchType === "semifinal-extra") return acertaron ? 5 : 10;
  if (matchType === "final-extra") return acertaron ? 10 : 20;
  return 10; // for all other match types
}

export function getAwardFee(awardName: string): number {
    // console.log(`Calculating fee for award type: ${awardName}`);
  if (awardName.toLowerCase() === "campeón") return 10;
  return 5; // for all other award types
}