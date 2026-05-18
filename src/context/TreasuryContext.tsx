import { createContext, useContext, useEffect, useReducer } from 'react';
import { FILIALES } from '../lib/constants';

type TreasuryState = {
  balances: Record<string, number>;
};

type Action =
  | { type: 'TICK' }
  | { type: 'TRANSFER'; from: string; to: string; amount: number }
  | { type: 'SWEEP_TICK'; fraction: number }
  | { type: 'REDISTRIBUTE'; fraction: number }
  | { type: 'RESET' };

const initialBalances: Record<string, number> = Object.fromEntries(
  FILIALES.map((f) => [f.id, f.balance])
);

const hqId = FILIALES.find((f) => f.isHQ)?.id ?? 'hq';

function reducer(state: TreasuryState, action: Action): TreasuryState {
  switch (action.type) {
    case 'TICK': {
      return {
        ...state,
        balances: Object.fromEntries(
          Object.entries(state.balances).map(([id, bal]) => [
            id,
            Math.max(0, bal + (Math.random() - 0.48) * 25_000),
          ])
        ),
      };
    }
    case 'TRANSFER': {
      const { from, to, amount } = action;
      if (from === to) return state;
      const fromBal = state.balances[from] ?? 0;
      const toBal = state.balances[to] ?? 0;
      const actual = Math.min(amount, fromBal);
      return {
        ...state,
        balances: {
          ...state.balances,
          [from]: Math.max(0, fromBal - actual),
          [to]: toBal + actual,
        },
      };
    }
    case 'SWEEP_TICK': {
      const { fraction } = action;
      const newBalances = { ...state.balances };
      let hqGain = 0;
      for (const f of FILIALES) {
        if (f.id === hqId) continue;
        const bal = newBalances[f.id] ?? 0;
        if (bal > f.target * 1.1) {
          const surplus = (bal - f.target) * fraction;
          newBalances[f.id] = bal - surplus;
          hqGain += surplus;
        }
      }
      newBalances[hqId] = (newBalances[hqId] ?? 0) + hqGain;
      return { ...state, balances: newBalances };
    }
    case 'REDISTRIBUTE': {
      const { fraction } = action;
      const newBalances = { ...state.balances };
      const hqTarget = FILIALES.find((f) => f.id === hqId)?.target ?? 0;
      let hqSpend = 0;
      for (const f of FILIALES) {
        if (f.id === hqId) continue;
        const bal = newBalances[f.id] ?? 0;
        if (bal < f.target * 0.9) {
          const deficit = (f.target - bal) * fraction;
          const hqAvailable = Math.max(0, (newBalances[hqId] ?? 0) - hqTarget - hqSpend);
          const available = Math.min(deficit, hqAvailable);
          if (available > 0) {
            newBalances[f.id] = bal + available;
            hqSpend += available;
          }
        }
      }
      newBalances[hqId] = Math.max(hqTarget, (newBalances[hqId] ?? 0) - hqSpend);
      return { ...state, balances: newBalances };
    }
    case 'RESET':
      return { balances: { ...initialBalances } };
    default:
      return state;
  }
}

const TreasuryContext = createContext<{
  state: TreasuryState;
  dispatch: React.Dispatch<Action>;
} | null>(null);

export function TreasuryProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { balances: { ...initialBalances } });

  useEffect(() => {
    const id = setInterval(() => dispatch({ type: 'TICK' }), 3500);
    return () => clearInterval(id);
  }, []);

  return (
    <TreasuryContext.Provider value={{ state, dispatch }}>
      {children}
    </TreasuryContext.Provider>
  );
}

export function useTreasury() {
  const ctx = useContext(TreasuryContext);
  if (!ctx) throw new Error('useTreasury must be used inside TreasuryProvider');
  return ctx;
}
