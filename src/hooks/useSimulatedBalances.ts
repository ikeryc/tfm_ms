import { FILIALES } from '../lib/constants';
import { useTreasury } from '../context/TreasuryContext';

export function useSimulatedBalances(_active: boolean) {
  const { state } = useTreasury();
  return FILIALES.map((f) => ({ id: f.id, balance: state.balances[f.id] ?? f.balance }));
}
