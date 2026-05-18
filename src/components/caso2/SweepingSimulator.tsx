import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, RotateCcw, CheckCircle, Loader, ArrowRight, MapPin } from 'lucide-react';
import { SectionTitle } from '../ui/SectionTitle';
import { FILIALES } from '../../lib/constants';
import { eur } from '../../lib/format';
import { useTreasury } from '../../context/TreasuryContext';

const BANKING_STEPS = [
  { time: '17:00', label: 'Cierre bancario · tesorero revisa posiciones' },
  { time: 'T+0',   label: 'Instrucciones SWIFT manuales (una por par)' },
  { time: 'T+1',   label: 'Confirmación bancaria · banco corresponsal' },
  { time: 'T+2',   label: 'Liquidación final en cuenta destino' },
];

interface NettingTransfer { from: string; to: string; amount: number }

type Position = {
  id: string; name: string; isHQ?: boolean;
  bal: number; target: number; diff: number;
  status: 'excess' | 'deficit' | 'target';
};

// Bruto: producto cruzado excedentes × deficitarios (como en banca tradicional sin netting)
function buildNettingBruto(positions: Position[]): NettingTransfer[] {
  const excesses = positions.filter((p) => p.status === 'excess');
  const deficits  = positions.filter((p) => p.status === 'deficit' && !p.isHQ);
  if (excesses.length === 0 || deficits.length === 0) return [];
  const totalNeed = deficits.reduce((s, p) => s + (-p.diff), 0);
  return excesses.flatMap((exc) =>
    deficits.map((def) => ({
      from:   exc.name,
      to:     def.name,
      amount: Math.round(exc.diff * ((-def.diff) / Math.max(totalNeed, 1))),
    }))
  );
}

// Neto: Pool HQ → cada deficitario (resultado del netting multilateral)
function buildNettingNeto(positions: Position[]): NettingTransfer[] {
  return positions
    .filter((p) => p.status === 'deficit' && !p.isHQ)
    .map((p) => ({ from: 'Pool HQ', to: p.name, amount: Math.round(-p.diff) }));
}

interface SweepEvent { name: string; amount: number }

interface SweepingSimulatorProps {
  compact?: boolean;
  onPhaseChange?: (phase: 'idle' | 'sweeping' | 'netting' | 'done') => void;
}

export function SweepingSimulator({ compact, onPhaseChange }: SweepingSimulatorProps = {}) {
  const { state, dispatch } = useTreasury();
  const [phase, setPhase] = useState<'idle' | 'sweeping' | 'netting' | 'done'>('idle');
  const [progress, setProgress] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [sweepEvents, setSweepEvents] = useState<SweepEvent[]>([]);
  const [visibleEvents, setVisibleEvents] = useState(0);
  const [capitalLiberado, setCapitalLiberado] = useState(0);
  // Snapshots congelados en el momento de ejecutar el sweep
  const [nettingBruto, setNettingBruto] = useState<NettingTransfer[]>([]);
  const [nettingNeto, setNettingNeto] = useState<NettingTransfer[]>([]);

  const positions = useMemo((): Position[] =>
    FILIALES.map((f) => {
      const bal  = state.balances[f.id] ?? f.balance;
      const diff = bal - f.target;
      const status: Position['status'] =
        bal > f.target * 1.1 ? 'excess' : bal < f.target * 0.9 ? 'deficit' : 'target';
      return { id: f.id, name: f.name, isHQ: f.isHQ, bal, target: f.target, diff, status };
    }),
    [state.balances],
  );

  const excedentes   = positions.filter((p) => p.status === 'excess');
  const deficitarios = positions.filter((p) => p.status === 'deficit');
  const enTarget     = positions.filter((p) => p.status === 'target');

  const capitalInmovilizado = useMemo(
    () => excedentes.filter((p) => !p.isHQ).reduce((s, p) => s + p.diff, 0),
    [excedentes],
  );

  // Preview en vivo para el estado idle (se actualiza cada tick)
  const nettingBrutoPreview = useMemo(() => buildNettingBruto(positions), [positions]);
  const nettingNetoPreview  = useMemo(() => buildNettingNeto(positions),  [positions]);

  // En idle: preview vivo. Post-start: snapshot congelado al momento de ejecutar
  const displayBruto = phase === 'idle' ? nettingBrutoPreview : nettingBruto;
  const displayNeto  = phase === 'idle' ? nettingNetoPreview  : nettingNeto;

  const reductionPct = displayBruto.length > 0
    ? Math.round((1 - displayNeto.length / displayBruto.length) * 100)
    : 0;

  async function start() {
    // Congelar snapshot en el estado actual antes de modificar balances
    const snapshotBruto = buildNettingBruto(positions);
    const snapshotNeto  = buildNettingNeto(positions);
    setNettingBruto(snapshotBruto);
    setNettingNeto(snapshotNeto);

    const events: SweepEvent[] = FILIALES.filter(
      (f) => !f.isHQ && (state.balances[f.id] ?? f.balance) > f.target * 1.1,
    ).map((f) => ({
      name:   f.name,
      amount: (state.balances[f.id] ?? f.balance) - f.target,
    }));
    const capLib = events.reduce((s, e) => s + e.amount, 0);

    setSweepEvents(events);
    setCapitalLiberado(capLib);
    setVisibleEvents(0);
    setPhase('sweeping');
    onPhaseChange?.('sweeping');
    setProgress(0);
    setElapsed(0);
    const startTime = Date.now();

    const eventInterval = events.length > 0 ? Math.floor(20 / Math.max(events.length, 1)) : 20;
    for (let i = 1; i <= 20; i++) {
      await new Promise((r) => setTimeout(r, 200));
      setProgress(i * 5);
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
      dispatch({ type: 'SWEEP_TICK', fraction: 0.05 });
      if (eventInterval > 0 && i % eventInterval === 0) {
        setVisibleEvents((prev) => Math.min(prev + 1, events.length));
      }
    }
    setVisibleEvents(events.length);

    setPhase('netting');
    onPhaseChange?.('netting');
    for (let i = 1; i <= 10; i++) {
      await new Promise((r) => setTimeout(r, 200));
      dispatch({ type: 'REDISTRIBUTE', fraction: 0.1 });
    }

    setPhase('done');
    onPhaseChange?.('done');
    setElapsed(Math.round((Date.now() - startTime) / 1000));
  }

  function reset() {
    setPhase('idle');
    onPhaseChange?.('idle');
    setProgress(0);
    setElapsed(0);
    setSweepEvents([]);
    setVisibleEvents(0);
    setCapitalLiberado(0);
    setNettingBruto([]);
    setNettingNeto([]);
  }

  return (
    <div>
      {!compact && (
        <SectionTitle
          title="Smart Contract Sweeping — Ejecución en tiempo real"
          subtitle="Netting multilateral automatizado vía smart contract. Las operaciones se calculan en tiempo real a partir de los saldos actuales."
          source="Elaboración propia"
        />
      )}

      {/* Panel de situación (solo idle) */}
      <AnimatePresence>
        {phase === 'idle' && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-2 gap-3 mb-5"
          >
            <div className="bg-[#193D2A]/50 border border-[#193D2A] rounded-lg p-4">
              <p className="text-[#7A9B88] text-[10px] font-semibold uppercase tracking-wider mb-2">
                Posición actual · Vidrala Group
              </p>
              <div className="flex gap-1.5 mb-3 flex-wrap">
                <span className="text-green-400 text-xs font-semibold bg-green-900/25 rounded px-2 py-0.5">
                  {excedentes.length}↑ exceso
                </span>
                <span className="text-red-400 text-xs font-semibold bg-red-900/25 rounded px-2 py-0.5">
                  {deficitarios.length}↓ déficit
                </span>
                <span className="text-blue-400 text-xs font-semibold bg-blue-900/25 rounded px-2 py-0.5">
                  {enTarget.length}= target
                </span>
              </div>
              <div className="border-t border-[#193D2A] pt-2.5">
                <p className="text-[#7A9B88] text-xs mb-0.5">Capital inmovilizado en excesos</p>
                <p className="text-white font-bold text-lg leading-tight">
                  {eur(capitalInmovilizado / 1_000_000, 2)}M€
                </p>
                <p className="text-[#7A9B88] text-[10px] mt-0.5">Cash ocioso sin rendir · necesita redistribución</p>
              </div>
            </div>

            <div className="bg-red-950/20 border border-red-900/30 rounded-lg p-4">
              <p className="text-red-400 text-[10px] font-semibold uppercase tracking-wider mb-2">
                Modelo bancario · proceso actual
              </p>
              <div className="space-y-1.5">
                {BANKING_STEPS.map((s, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs">
                    <span className="text-red-400 font-mono shrink-0 w-8">{s.time}</span>
                    <span className="text-[#7A9B88]">{s.label}</span>
                  </div>
                ))}
              </div>
              <div className="mt-2.5 pt-2 border-t border-red-900/30 text-xs">
                <span className="text-red-400 font-semibold">18–48h de espera · proceso manual</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controles */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        {phase === 'idle' && (
          <button
            onClick={start}
            className="flex items-center gap-2 bg-[#3D9E63] text-[#0A2116] font-semibold px-5 py-2.5 rounded-lg hover:bg-[#3D9E63]/90 transition-colors"
          >
            <Play className="w-4 h-4" /> Ejecutar sweep automático
          </button>
        )}
        {phase !== 'idle' && (
          <button onClick={reset} className="flex items-center gap-2 border border-[#193D2A] text-[#7A9B88] px-4 py-2 rounded-lg hover:text-white transition-colors text-sm">
            <RotateCcw className="w-3.5 h-3.5" /> Reiniciar
          </button>
        )}
        {phase === 'sweeping' && (
          <>
            <div className="flex items-center gap-2">
              <Loader className="w-4 h-4 text-[#3D9E63] animate-spin" />
              <span className="text-[#3D9E63] text-sm">Barriendo excedentes… {elapsed}s</span>
            </div>
            <span className="flex items-center gap-1 text-[#7A9B88] text-xs">
              <MapPin className="w-3 h-3" /> observa el mapa
            </span>
          </>
        )}
        {phase === 'netting' && (
          <>
            <div className="flex items-center gap-2">
              <Loader className="w-4 h-4 text-blue-400 animate-spin" />
              <span className="text-blue-400 text-sm">Calculando netting multilateral…</span>
            </div>
            <span className="flex items-center gap-1 text-[#7A9B88] text-xs">
              <MapPin className="w-3 h-3" /> observa el mapa
            </span>
          </>
        )}
        {phase === 'done' && (
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span className="text-green-400 text-sm font-semibold">Sweep completado en {elapsed}s</span>
          </div>
        )}
      </div>

      {/* Feed de eventos */}
      <AnimatePresence>
        {(phase === 'sweeping' || phase === 'netting') && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 bg-[#0A2116] border border-[#193D2A] rounded-lg overflow-hidden"
          >
            <div className="px-4 py-2 border-b border-[#193D2A]">
              {phase === 'sweeping' ? (
                <p className="text-[#3D9E63] text-xs font-semibold">
                  Fase 1 · Consolidando excedentes → Pool HQ
                </p>
              ) : (
                <p className="text-blue-400 text-xs font-semibold">
                  Fase 2 · Netting multilateral — {nettingBruto.length} flujos → {nettingNeto.length} transfers
                </p>
              )}
            </div>
            <div className="px-4 py-2 space-y-1 max-h-28 overflow-y-auto">
              {sweepEvents.slice(0, visibleEvents).map((ev, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2 text-xs"
                >
                  <CheckCircle className="w-3 h-3 text-green-400 shrink-0" />
                  <span className="text-white font-medium">{ev.name}</span>
                  <span className="text-green-400 font-mono">+{eur(ev.amount / 1_000_000, 2)}M€</span>
                  <ArrowRight className="w-3 h-3 text-[#7A9B88] shrink-0" />
                  <span className="text-[#7A9B88]">Pool HQ</span>
                </motion.div>
              ))}
              {sweepEvents.length === 0 && phase === 'sweeping' && (
                <p className="text-[#7A9B88] text-xs italic">Sin excedentes detectados — balances en target</p>
              )}
              {phase === 'netting' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-[#7A9B88] text-xs mt-1 italic"
                >
                  Smart contract calculando transferencias mínimas…
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress bar */}
      {phase !== 'idle' && (
        <div className="mb-5">
          <div className="bg-[#193D2A] rounded-full h-2 mb-1">
            <motion.div
              className="bg-[#3D9E63] h-2 rounded-full shadow-[0_0_8px_rgba(61,158,99,0.5)]"
              animate={{ width: `${phase === 'done' || phase === 'netting' ? 100 : progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <div className="flex justify-between text-[#7A9B88] text-xs">
            <span>
              {phase === 'sweeping'
                ? `Consolidando fondos en Pool HQ · ${progress}%`
                : phase === 'netting'
                ? 'Calculando netting multilateral…'
                : 'Completado'}
            </span>
            <span>{phase === 'done' || phase === 'netting' ? 100 : progress}%</span>
          </div>
        </div>
      )}


      {/* Netting comparison */}
      <div className="mb-5">
        <div className="flex gap-2 items-stretch">
          {/* Brutas */}
          <div className="flex-1 bg-[#193D2A] rounded-lg p-4 min-w-0">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-semibold text-xs">Banca tradicional</h3>
              <span className="text-red-400 text-[10px] font-semibold shrink-0 ml-1">
                {displayBruto.length > 0 ? `${displayBruto.length} SWIFT` : '—'}
              </span>
            </div>
            <div className="space-y-1 max-h-52 overflow-y-auto">
              {displayBruto.length > 0 ? displayBruto.map((t, i) => (
                <div key={i} className={`flex items-center text-[10px] py-1 px-1.5 rounded gap-1 ${phase === 'done' ? 'opacity-35 line-through' : ''}`}>
                  <span className="text-[#7A9B88] truncate">{t.from}</span>
                  <ArrowRight className="w-2.5 h-2.5 text-[#7A9B88] shrink-0" />
                  <span className="text-[#7A9B88] truncate">{t.to}</span>
                  <span className="text-white font-mono ml-auto pl-1 shrink-0">{eur(t.amount / 1_000_000, 1)}M</span>
                </div>
              )) : (
                <p className="text-[#7A9B88] text-[10px] italic py-2">Saldos equilibrados · sin movimientos pendientes</p>
              )}
            </div>
            <div className="mt-2.5 pt-2 border-t border-[#0A2116] text-xs">
              <span className="text-[#7A9B88]">Liquidación 18–48h · T+1/T+2</span>
            </div>
          </div>

          {/* Separador */}
          <div className="flex flex-col items-center justify-center gap-1 shrink-0 w-10">
            <div className="w-px flex-1 bg-[#193D2A]" />
            <div className="flex flex-col items-center gap-1">
              {reductionPct > 0 && (
                <>
                  <span className="bg-amber-500/20 text-amber-400 text-[9px] font-bold rounded px-1 py-0.5">−{reductionPct}%</span>
                  <span className="text-[#7A9B88] text-[8px]">ops</span>
                </>
              )}
            </div>
            <div className="w-px flex-1 bg-[#193D2A]" />
          </div>

          {/* Netas */}
          <div className="flex-1 bg-[#193D2A] rounded-lg p-4 min-w-0">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-semibold text-xs">Smart contract</h3>
              <span className="text-green-400 text-[10px] font-semibold shrink-0 ml-1">
                {displayNeto.length > 0 ? `${displayNeto.length} on-chain` : '—'}
              </span>
            </div>
            <div className="space-y-1.5">
              {displayNeto.length > 0 ? displayNeto.map((t, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: phase !== 'idle' ? 1 : 0.4, x: 0 }}
                  transition={{ delay: i * 0.25 }}
                  className="flex items-center text-[10px] py-1 px-1.5 rounded bg-green-900/20 border border-green-800/30 gap-1"
                >
                  <span className="text-green-300 truncate">{t.from}</span>
                  <ArrowRight className="w-2.5 h-2.5 text-green-400 shrink-0" />
                  <span className="text-green-300 truncate">{t.to}</span>
                  <span className="text-white font-mono ml-auto pl-1 shrink-0">{eur(t.amount / 1_000_000, 1)}M</span>
                </motion.div>
              )) : (
                <p className="text-[#7A9B88] text-[10px] italic py-2">Sin déficits · pool en equilibrio</p>
              )}
            </div>
            <div className="mt-2.5 pt-2 border-t border-[#0A2116] text-xs">
              <span className="text-[#7A9B88]">Liquidación ~6s · automático</span>
            </div>
          </div>
        </div>
      </div>

      {/* Resultado final */}
      <AnimatePresence>
        {phase === 'done' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-900/15 border border-green-700/40 rounded-xl p-5"
          >
            <h3 className="text-green-400 font-bold text-xs uppercase tracking-wider mb-4">
              Resultado del sweep · {elapsed}s de ejecución
            </h3>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="bg-[#193D2A]/60 rounded-lg p-3">
                <div className="text-[#7A9B88] text-[10px] mb-1">Operaciones</div>
                <div className="text-white font-bold text-xl">
                  {nettingBruto.length} → {nettingNeto.length}
                </div>
                <div className="text-green-400 text-xs">
                  {nettingBruto.length > 0
                    ? `−${Math.round((1 - nettingNeto.length / nettingBruto.length) * 100)}% operaciones`
                    : 'pool equilibrado'}
                </div>
              </div>
              <div className="bg-[#193D2A]/60 rounded-lg p-3">
                <div className="text-[#7A9B88] text-[10px] mb-1">Tiempo de liquidación</div>
                <div className="text-white font-bold text-xl">{elapsed}s</div>
                <div className="text-green-400 text-xs">vs 18–48h bancario</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#3D9E63]/10 border border-[#3D9E63]/30 rounded-lg p-3">
                <div className="text-[#7A9B88] text-[10px] mb-1">Capital redistribuido</div>
                <div className="text-[#3D9E63] font-bold text-xl">
                  {capitalLiberado > 0 ? `${eur(capitalLiberado / 1_000_000, 2)}M€` : '—'}
                </div>
                <div className="text-[#7A9B88] text-xs">excesos → déficits vía pool</div>
              </div>
              <div className="bg-[#193D2A]/60 rounded-lg p-3">
                <div className="text-[#7A9B88] text-[10px] mb-1">Automatización</div>
                <div className="text-white font-bold text-xl">24/7</div>
                <div className="text-green-400 text-xs">vs 1 vez al día · manual</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
