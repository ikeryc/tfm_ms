import type { StablecoinPrice } from '../../types';

const FALLBACK: Record<string, StablecoinPrice> = {
  'usd-coin': { usd: 1.0001, eur: 0.9201 },
  'euro-coin': { usd: 1.0876, eur: 1.0002 },
  'tether': { usd: 1.0000, eur: 0.9200 },
};

export async function fetchStablecoinPrices(): Promise<Record<string, StablecoinPrice>> {
  try {
    const res = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=usd-coin,euro-coin,tether&vs_currencies=usd,eur',
      { signal: AbortSignal.timeout(5000) }
    );
    if (!res.ok) throw new Error('CoinGecko error');
    return await res.json();
  } catch {
    return FALLBACK;
  }
}
