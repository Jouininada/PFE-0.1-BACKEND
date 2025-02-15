export const ciel = (value: number, digitAfterComma: number = 2) => {
  const factor = Math.pow(10, digitAfterComma);
  return Math.round(value * factor) / factor;
};
