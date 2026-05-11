import { useEffect, useState } from 'react';
import { fetchGasData } from '../lib/api/etherscan';
import type { GasData } from '../types';

export function useGasPrice() {
  const [gas, setGas] = useState<GasData | null>(null);

  useEffect(() => {
    fetchGasData().then(setGas);
  }, []);

  return gas;
}
