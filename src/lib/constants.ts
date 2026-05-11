// Cifras canónicas — única fuente de verdad

export const CASO1 = {
  // KPIs de diagnóstico
  tiempoTradicionalMin: '1–5 días',
  tiempoStablecoin: '< 5 minutos',
  costeAnualTradicional: 1_217_300,
  costeAnualStablecoin: 207_000,
  ahorroAnual: 1_010_300,
  ahorroPct: 83,
  volumenReferencia: 50_000_000,

  // Desglose coste tradicional — categorías TFM (sobre 50M€)
  costeComisionesYFX: 1_125_000,
  costePersonalReconciliacion: 80_000,
  costeOportunidad: 12_300,

  // TCO
  capex: 130_000,   // €100k técnico + €30k legal/compliance
  opexAnual: 207_000, // all-in: provider €142k + personal €15k + comisiones variables €50k
  paybackDias: 41,
  roi12m: 618,      // (ahorroAnual − opexAnual) / capex × 100

  // Ratios para ComparativaInteractiva
  tasaTradicionalBps: 244,    // 2.44% sobre volumen
  stablecoinFixedCost: 157_000, // costes fijos: provider €142k + personal €15k
  stablecoinVariableBps: 10,  // 0.10% variable sobre volumen

  // Importe por defecto del FlowSimulator
  montoDemo: 2_500_000,
} as const;

export const CASO2 = {
  // KPIs de diagnóstico
  capitalInmovilizadoPct: 40,
  transferenciasFisicasReduccionPct: 60,
  costeAnualTradicional: 1_145_500,
  costeAnualStablecoin: 227_000,
  ahorroAnual: 918_500,
  ahorroPct: 80.2,
  volumenReferencia: 120_000_000,

  // Netting multilateral
  transferenciasAntesDe: 12,
  transferenciasDesDe: 4,
  costeSwiftPorTransf: 150,
  costeStablecoinPorTransf: 0.02,

  // TCO
  capex: 135_000,   // €105k técnico + €30k legal/compliance
  opexAnual: 227_000, // all-in: transfers €15k + reporting €20k + provider €142k + financiación intragrupo €50k
  paybackDias: 59,
  roi12m: 512,      // (ahorroAnual − opexAnual) / capex × 100

  // Smart contract
  gasUsadoGwei: 0.0003,
  tiempoSweepSeg: 90,
} as const;

export const FILIALES: Array<{
  id: string;
  name: string;
  city: string;
  country: string;
  coordinates: [number, number];
  balance: number;
  currency: string;
  target: number;
  isHQ?: boolean;
}> = [
  { id: 'hq',            name: 'Vidrala HQ',          city: 'Llodio, Álava',       country: 'ES', coordinates: [-2.948, 43.150], balance: 10_000_000, currency: 'EUR', target: 8_000_000, isHQ: true },
  { id: 'aiala',         name: 'Aiala Vidrio',         city: 'Llodio, Álava',       country: 'ES', coordinates: [-2.943, 43.147], balance:  4_500_000, currency: 'EUR', target: 3_500_000 },
  { id: 'crisnova',      name: 'Crisnova Vidrio',      city: 'Caudete, Albacete',   country: 'ES', coordinates: [-0.992, 38.703], balance:  3_800_000, currency: 'EUR', target: 4_500_000 },
  { id: 'castellar',     name: 'Castellar Vidrio',     city: 'Castellar del Vallès',country: 'ES', coordinates: [ 2.087, 41.617], balance:  2_100_000, currency: 'EUR', target: 3_000_000 },
  { id: 'gallo',         name: 'Gallo Vidro',          city: 'Marinha Grande',      country: 'PT', coordinates: [-8.934, 39.752], balance:  5_200_000, currency: 'EUR', target: 4_000_000 },
  { id: 'sb',            name: 'SB Vidros',            city: 'Marinha Grande',      country: 'PT', coordinates: [-8.929, 39.747], balance:  1_800_000, currency: 'EUR', target: 3_000_000 },
  { id: 'elton',         name: 'Encirc UK',            city: 'Elton, Cheshire',     country: 'GB', coordinates: [-2.815, 53.277], balance:  2_100_000, currency: 'GBP', target: 4_000_000 },
  { id: 'derrylin',      name: 'Encirc Derrylin',      city: 'Derrylin, N. Ireland',country: 'GB', coordinates: [-7.572, 54.196], balance:  3_200_000, currency: 'GBP', target: 3_000_000 },
  { id: 'vidroporto_s',  name: 'Vidroporto Sudeste',   city: 'Porto Ferreira, SP',  country: 'BR', coordinates: [-47.479, -21.854], balance: 1_500_000, currency: 'BRL', target: 3_000_000 },
  { id: 'vidroporto_n',  name: 'Vidroporto Nordeste',  city: 'Estância, Sergipe',   country: 'BR', coordinates: [-37.439, -11.269], balance:   800_000, currency: 'BRL', target: 2_000_000 },
];
