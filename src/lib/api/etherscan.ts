import type { GasData } from '../../types';

const FALLBACK: GasData = {
  safe: 28,
  propose: 35,
  fast: 47,
  blockNumber: '0x' + Math.floor(Math.random() * 0xFFFFFF).toString(16),
};

const API_KEY = import.meta.env.VITE_POLYGONSCAN_KEY ?? '';

export async function fetchGasData(): Promise<GasData> {
  try {
    const base = API_KEY
      ? `https://api.polygonscan.com/api?module=gastracker&action=gasoracle&apikey=${API_KEY}`
      : 'https://api.polygonscan.com/api?module=gastracker&action=gasoracle';

    const [gasRes, blockRes] = await Promise.all([
      fetch(base, { signal: AbortSignal.timeout(5000) }),
      fetch(
        `https://api.polygonscan.com/api?module=proxy&action=eth_blockNumber${API_KEY ? `&apikey=${API_KEY}` : ''}`,
        { signal: AbortSignal.timeout(5000) }
      ),
    ]);

    if (!gasRes.ok || !blockRes.ok) throw new Error('Polygonscan error');
    const gasJson = await gasRes.json();
    const blockJson = await blockRes.json();

    return {
      safe: Number(gasJson.result?.SafeGasPrice ?? FALLBACK.safe),
      propose: Number(gasJson.result?.ProposeGasPrice ?? FALLBACK.propose),
      fast: Number(gasJson.result?.FastGasPrice ?? FALLBACK.fast),
      blockNumber: blockJson.result ?? FALLBACK.blockNumber,
    };
  } catch {
    return FALLBACK;
  }
}
