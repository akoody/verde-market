export const formatMoney = (value: number) =>
  `${new Intl.NumberFormat("ru-MD", { maximumFractionDigits: 0 }).format(value)} L`;

export const pluralize = (count: number, words: [string, string, string]) => {
  const value = Math.abs(count) % 100;
  const last = value % 10;
  if (value > 10 && value < 20) return words[2];
  if (last > 1 && last < 5) return words[1];
  if (last === 1) return words[0];
  return words[2];
};
