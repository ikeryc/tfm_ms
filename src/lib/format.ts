export const eur = (n: number, decimals = 0) =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: decimals }).format(n);

export const usd = (n: number, decimals = 2) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: decimals }).format(n);

export const pct = (n: number, decimals = 1) =>
  `${n.toFixed(decimals)}%`;

export const num = (n: number) =>
  new Intl.NumberFormat('es-ES').format(n);

export const shortHash = () => {
  const hex = () => Math.floor(Math.random() * 16).toString(16);
  return '0x' + Array.from({ length: 64 }, hex).join('');
};

export const shortAddr = () => {
  const hex = () => Math.floor(Math.random() * 16).toString(16);
  return '0x' + Array.from({ length: 40 }, hex).join('');
};

export const timestamp = () => {
  const now = new Date();
  return now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
};
