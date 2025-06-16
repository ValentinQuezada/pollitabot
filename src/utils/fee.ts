export function getAwardFee(awardName: string): number {
    // console.log(`Calculating fee for award type: ${awardName}`);
  if (awardName.toLowerCase() === "campeón") return 10;
  return 5; // for all other award types
}