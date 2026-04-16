// 千分位
export function formatThousands(value: number | string): string {
  if (value === null || value === undefined) return "0";

  const num = Number(value);

  if (isNaN(num)) return "0";

  return num.toLocaleString("en-US");
}

/**
 * 格式化數字到指定小數位
 * @param value 數值
 * @param digits 小數位數（0 = 整數）
 */
export function formatNumber(
  value: number | string,
  digits: number = 0
): number {
  if (value === null || value === undefined) return 0;

  const num = Number(value);
  if (isNaN(num)) return 0;

  const factor = Math.pow(10, digits);
  return Math.round(num * factor) / factor;
}
