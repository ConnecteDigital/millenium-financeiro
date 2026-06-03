export const p = (v: string | number): number =>
  parseFloat(String(v).replace(',', '.')) || 0
