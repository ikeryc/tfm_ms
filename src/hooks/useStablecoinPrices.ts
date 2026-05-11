import { useEffect, useState } from 'react';
import { fetchStablecoinPrices } from '../lib/api/coingecko';
import type { StablecoinPrice } from '../types';

export function useStablecoinPrices() {
  const [prices, setPrices] = useState<Record<string, StablecoinPrice> | null>(null);
  const [live, setLive] = useState(false);

  useEffect(() => {
    fetchStablecoinPrices().then((data) => {
      setPrices(data);
      const isLive = 'usd-coin' in data && typeof data['usd-coin'].usd === 'number';
      setLive(isLive);
    });
    const id = setInterval(() => {
      fetchStablecoinPrices().then(setPrices);
    }, 60_000);
    return () => clearInterval(id);
  }, []);

  return { prices, live };
}
