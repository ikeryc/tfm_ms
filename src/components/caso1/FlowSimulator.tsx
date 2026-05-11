import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Clock, Loader, Play, RotateCcw } from 'lucide-react';
import { SectionTitle } from '../ui/SectionTitle';
import { useGasPrice } from '../../hooks/useGasPrice';
import { shortHash, timestamp, eur } from '../../lib/format';
import { FILIALES, CASO1 } from '../../lib/constants';
import { useTreasury } from '../../context/TreasuryContext';

type Status = 'idle' | 'running' | 'done';

const STEP_DURATIONS = [2500, 3000, 4000, 2000, 3000, 2000];

interface FlowSimulatorProps {
  compact?: boolean;
  onPhaseChange?: (phase: 'idle' | 'running' | 'done', stepIndex: number, fromId: string, toId: string) => void;
}

export function FlowSimulator({ compact, onPhaseChange }: FlowSimulatorProps = {}) {
  const { state, dispatch } = useTreasury();
  const [fromId, setFromId] = useState<string>('hq');
  const [toId, setToId] = useState<string>('elton');
  const [amount, setAmount] = useState<number>(CASO1.montoDemo);
  const [statuses, setStatuses] = useState<Status[]>(STEP_DURATIONS.map(() => 'idle'));
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const [txHash, setTxHash] = useState('');
  const [startTs, setStartTs] = useState('');
  const [endTs, setEndTs] = useState('');
  const [elapsed, setElapsed] = useState(0);
  const gas = useGasPrice();
  const timerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  const fromFilial = FILIALES.find((f) => f.id === fromId);
  const toFilial = FILIALES.find((f) => f.id === toId);
  const fromBalance = state.balances[fromId] ?? 0;
  const isValid = amount > 0 && amount <= fromBalance && fromId !== toId;

  const steps = useMemo(() => [
    { id: 1, title: 'Orden de pago ERP', desc: `${fromFilial?.name ?? ''} genera instrucción de pago a ${toFilial?.name ?? ''} vía SAP S/4HANA`, cost: '0 €', duration: STEP_DURATIONS[0] },
    { id: 2, title: 'On-ramp fiat → stablecoin', desc: 'Custodio Circle convierte EUR a EURC (1:1). Verificación KYC/AML automática.', cost: '0,02%', duration: STEP_DURATIONS[1] },
    { id: 3, title: 'Ejecución on-chain (Polygon)', desc: 'Transfer de EURC confirmado en la red Polygon.', cost: '~$0.01', duration: STEP_DURATIONS[2] },
    { id: 4, title: 'Confirmación blockchain', desc: 'Hash de transacción inmutable. 1 bloque de confirmación (~2 s).', cost: '—', duration: STEP_DURATIONS[3] },
    { id: 5, title: 'Off-ramp stablecoin → fiat', desc: `Custodio destino convierte EURC → ${toFilial?.currency ?? 'EUR'}. Fondos disponibles en cuenta ${toFilial?.name ?? ''}.`, cost: '0,02%', duration: STEP_DURATIONS[4] },
    { id: 6, title: 'Reconciliación ERP', desc: 'SAP destino registra automáticamente el ingreso. Asiento contable cerrado.', cost: '0 €', duration: STEP_DURATIONS[5] },
  ], [fromFilial?.name, toFilial?.name, toFilial?.currency]);

  const totalDuration = STEP_DURATIONS.reduce((a, d) => a + d, 0);

  async function start() {
    const cfg = { from: fromId, to: toId, amount };

    setRunning(true);
    setFinished(false);
    setTxHash(shortHash());
    setStartTs(timestamp());
    setStatuses(STEP_DURATIONS.map(() => 'idle'));
    setElapsed(0);

    const startTime = Date.now();
    timerRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 500);

    for (let i = 0; i < STEP_DURATIONS.length; i++) {
      setStatuses((prev) => prev.map((s, j) => (j === i ? 'running' : s)));
      if (i === 2) onPhaseChange?.('running', 2, cfg.from, cfg.to);
      if (i === 3) onPhaseChange?.('running', 3, cfg.from, cfg.to);
      await new Promise((r) => setTimeout(r, STEP_DURATIONS[i]));
      setStatuses((prev) => prev.map((s, j) => (j === i ? 'done' : s)));

      if (i === 3) {
        dispatch({ type: 'TRANSFER', from: cfg.from, to: cfg.to, amount: cfg.amount });
      }
    }

    clearInterval(timerRef.current);
    setRunning(false);
    setFinished(true);
    setEndTs(timestamp());
    setElapsed(Math.round(totalDuration / 1000));
    onPhaseChange?.('done', 5, cfg.from, cfg.to);
  }

  function reset() {
    clearInterval(timerRef.current);
    setRunning(false);
    setFinished(false);
    setStatuses(STEP_DURATIONS.map(() => 'idle'));
    setElapsed(0);
    setTxHash('');
    setStartTs('');
    setEndTs('');
    onPhaseChange?.('idle', -1, fromId, toId);
  }

  useEffect(() => () => clearInterval(timerRef.current), []);

  const stepIcon = (s: Status) => {
    if (s === 'running') return <Loader className="w-4 h-4 text-[#3D9E63] animate-spin" />;
    if (s === 'done') return <CheckCircle className="w-4 h-4 text-green-400" />;
    return <Clock className="w-4 h-4 text-[#7A9B88]" />;
  };

  const doneCount = statuses.filter((s) => s === 'done').length;

  const destOptions = FILIALES.filter((f) => f.id !== fromId);

  return (
    <div>
      {!compact && (
        <SectionTitle
          title="Simulador de flujo end-to-end"
          subtitle={`Transferencia ${fromFilial?.name ?? ''} → ${toFilial?.name ?? ''} vía EURC sobre Polygon`}
          source="Elaboración propia"
        />
      )}

      {/* Config form — solo visible cuando no hay simulación activa */}
      {!running && !finished && (
        <div className="bg-[#193D2A]/40 border border-[#193D2A] rounded-lg p-5 mb-6">
          <h3 className="text-white font-medium text-sm mb-4">Configurar transferencia</h3>
          <div className={`grid gap-4 ${compact ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-3'}`}>
            <div>
              <label className="block text-[#7A9B88] text-xs mb-1.5">Origen</label>
              <select
                value={fromId}
                onChange={(e) => {
                  const next = e.target.value;
                  setFromId(next);
                  if (toId === next) setToId(FILIALES.find((f) => f.id !== next)?.id ?? '');
                }}
                className="w-full bg-[#0A2116] border border-[#193D2A] rounded px-3 py-2 text-white text-xs focus:outline-none focus:border-[#3D9E63]/60"
              >
                {FILIALES.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} — {eur(state.balances[f.id] ?? f.balance, 0)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[#7A9B88] text-xs mb-1.5">Destino</label>
              <select
                value={toId}
                onChange={(e) => setToId(e.target.value)}
                className="w-full bg-[#0A2116] border border-[#193D2A] rounded px-3 py-2 text-white text-xs focus:outline-none focus:border-[#3D9E63]/60"
              >
                {destOptions.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} — {eur(state.balances[f.id] ?? f.balance, 0)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[#7A9B88] text-xs mb-1.5">
                Importe ({fromFilial?.currency ?? 'EUR'}) — máx.{' '}
                <span className="text-white font-mono">{eur(fromBalance, 0)}</span>
              </label>
              <input
                type="number"
                min={1}
                max={fromBalance}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full bg-[#0A2116] border border-[#193D2A] rounded px-3 py-2 text-white text-xs font-mono focus:outline-none focus:border-[#3D9E63]/60"
              />
              {amount > fromBalance && (
                <p className="text-red-400 text-[10px] mt-1">Supera el saldo disponible</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        {!running && !finished && (
          <button
            onClick={start}
            disabled={!isValid}
            className="flex items-center gap-2 bg-[#3D9E63] text-[#0A2116] font-semibold px-5 py-2.5 rounded-lg hover:bg-[#3D9E63]/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Play className="w-4 h-4" /> Iniciar transferencia
          </button>
        )}
        {(running || finished) && (
          <button
            onClick={reset}
            className="flex items-center gap-2 border border-[#193D2A] text-[#7A9B88] px-4 py-2 rounded-lg hover:text-white transition-colors text-sm"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reiniciar
          </button>
        )}
        {running && (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#3D9E63] animate-pulse" />
            <span className="text-[#3D9E63] text-sm font-medium">Procesando… {elapsed}s</span>
          </div>
        )}
        {gas && (
          <span className="text-[#7A9B88] text-xs ml-auto">
            Gas Polygon: {gas.propose} Gwei · Bloque #{parseInt(gas.blockNumber, 16).toLocaleString('es-ES')} · Fuente: Polygonscan
          </span>
        )}
      </div>

      <div className={`grid gap-6 ${compact ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-5'}`}>
        {/* Steps */}
        <div className={`space-y-3 ${compact ? '' : 'lg:col-span-3'}`}>
          {steps.map((step, i) => {
            const status = statuses[i];
            const active = status === 'running' || status === 'done';
            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0.4 }}
                animate={{ opacity: active ? 1 : 0.4 }}
                className={`flex gap-4 p-4 rounded-lg border transition-all ${
                  status === 'done' ? 'border-green-700/40 bg-green-900/10' :
                  status === 'running' ? 'border-[#3D9E63]/50 bg-[#3D9E63]/5' :
                  'border-[#193D2A] bg-[#193D2A]/30'
                }`}
              >
                <div className="flex flex-col items-center gap-1 pt-0.5">
                  {stepIcon(status)}
                  {i < steps.length - 1 && (
                    <div className={`w-0.5 h-full min-h-6 rounded ${status === 'done' ? 'bg-green-700/40' : 'bg-[#193D2A]'}`} />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-medium text-sm">
                      <span className="text-[#7A9B88] mr-1">{step.id}.</span>
                      {step.title}
                    </span>
                    <span className="text-[#7A9B88] text-xs font-mono">{step.cost}</span>
                  </div>
                  <p className="text-[#7A9B88] text-xs mt-0.5">{step.desc}</p>
                  {status === 'done' && step.id === 4 && txHash && (
                    <p className="text-[#3D9E63] text-[10px] font-mono mt-1 break-all">{txHash.slice(0, 42)}…</p>
                  )}
                  {status === 'done' && step.id === 4 && (
                    <p className="text-green-400 text-[10px] mt-1 font-semibold">
                      ✓ Saldo actualizado: {eur(amount)} deducido de {fromFilial?.name}
                    </p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* SWIFT parallel timeline — oculto en modo compact */}
        {!compact && <div className="lg:col-span-2 bg-[#193D2A]/40 border border-[#193D2A] rounded-lg p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-white font-semibold text-sm">Por SWIFT esta operación estaría en…</span>
          </div>
          {[
            { label: 'T+0', desc: 'Orden enviada al banco origen', done: doneCount >= 1 },
            { label: 'T+0', desc: 'Banco origen procesa (EOD)', done: false },
            { label: 'T+1', desc: 'Banco corresponsal recibe', done: false },
            { label: 'T+2', desc: 'Banco destino recibe fondos', done: false },
            { label: 'T+3', desc: 'Liquidación y disponibilidad final', done: false },
          ].map((row, i) => (
            <div key={i} className={`flex items-start gap-3 py-2 border-b border-[#193D2A] last:border-0 ${row.done ? 'opacity-100' : 'opacity-50'}`}>
              <span className="text-red-400 text-xs font-mono w-8 pt-0.5">{row.label}</span>
              <span className="text-[#7A9B88] text-xs">{row.desc}</span>
            </div>
          ))}

          <AnimatePresence>
            {finished && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-5 bg-green-900/20 border border-green-700/40 rounded-lg p-4"
              >
                <p className="text-green-400 font-semibold text-sm mb-1">Operación liquidada</p>
                <p className="text-white font-bold text-2xl mb-1">{elapsed}s</p>
                <p className="text-[#7A9B88] text-xs">vs. 72h estimadas vía SWIFT</p>
                <div className="mt-3 text-xs text-[#7A9B88]">
                  <div>Inicio: {startTs}</div>
                  <div>Fin: {endTs}</div>
                  <div className="mt-1 text-green-400 font-semibold">Ahorro de tiempo: 99,99%</div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>}
      </div>

      {/* Progress bar */}
      <div className="mt-4 bg-[#193D2A] rounded-full h-1.5">
        <motion.div
          className="bg-[#3D9E63] h-1.5 rounded-full shadow-[0_0_8px_rgba(61,158,99,0.5)]"
          animate={{ width: `${(doneCount / steps.length) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
      <div className="flex justify-between text-[#7A9B88] text-xs mt-1">
        <span>Paso {doneCount} de {steps.length}</span>
        <span>{Math.round((doneCount / steps.length) * 100)}%</span>
      </div>
    </div>
  );
}
