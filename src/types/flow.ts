export type TransferFlowState = {
  active: boolean;
  phase: 'idle' | 'transmitting' | 'confirming' | 'done';
  fromId: string | null;
  toId: string | null;
};

export type SweepFlowState = {
  active: boolean;
  phase: 'idle' | 'sweeping' | 'netting' | 'done';
  excedentIds: string[];
  deficitIds: string[];
  hqId: string;
};
