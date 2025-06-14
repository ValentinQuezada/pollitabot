export function getMatchFee(matchType: string, acertaronFinalRegular = false): number {
    // console.log(`Calculating fee for match type: ${matchType}`);
  if (matchType === "group-regular") return 5;
  if (matchType === "final-regular") return 20;
  if (matchType === "final-extra") return acertaronFinalRegular ? 10 : 20;
  return 10; // for all other match types
}

export function getAwardFee(awardName: string): number {
    // console.log(`Calculating fee for award type: ${awardName}`);
  if (awardName === "campeon") return 10;
  return 5; // for all other award types
}