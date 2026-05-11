export interface KPIData {
  label: string;
  before: string;
  after: string;
  delta: string;
  positive?: boolean;
}

export interface FlowStep {
  id: number;
  title: string;
  description: string;
  cost: string;
  duration: string;
  status: 'idle' | 'running' | 'done';
  detail?: string;
}

export interface Filial {
  id: string;
  name: string;
  city: string;
  country: string;
  coordinates: [number, number];
  balance: number;
  currency: string;
  target: number;
  isHQ?: boolean;
}

export interface TCOData {
  capex: number;
  opexAnual: number;
  ahorroPrimerAño: number;
  paybackDias: number;
  roi12m: number;
}

export interface NettingEntry {
  from: string;
  to: string;
  amount: number;
}

export interface StablecoinPrice {
  usd: number;
  eur: number;
}

export interface GasData {
  safe: number;
  propose: number;
  fast: number;
  blockNumber: string;
}
