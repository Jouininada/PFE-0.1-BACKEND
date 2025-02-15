export function createDineroAmountFromFloatWithDynamicCurrency(
  value: number,
  digitAfterComma: number,
) {
  return Math.round(value * Math.pow(10, digitAfterComma));
}
