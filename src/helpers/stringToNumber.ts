export default function stringToNumber(val?: string | number | null): number {
  if (!val) {
    return 0;
  }
  if (typeof val === 'number') {
    return val;
  }
  return Number.isNaN(Number(val)) ? 0 : Number(val);
}
