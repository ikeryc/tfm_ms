import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, RotateCcw, CheckCircle, Loader, ArrowRight } from 'lucide-react';
import { SectionTitle } from '../ui/SectionTitle';
import { CASO2 } from '../../lib/constants';
import { eur, shortHash, shortAddr } from '../../lib/format';
import { useTreasury } from '../../context/TreasuryContext';

const NETTING_BRUTO = [
  { from: 'Vidrala HQ',    to: 'Encirc UK',            amount: 2_200_000 },
  { from: 'Gallo Vidro',   to: 'Encirc UK',            amount: 1_500_000 },
  { from: 'Aiala Vidrio',  to: 'Encirc UK',            amount: 1_300_000 },
  { from: 'Aiala Vidrio',  to: 'Vidroporto Sudeste',   amount:   900_000 },
  { from: 'Vidrala HQ',    to: 'SB Vidros',            amount:   800_000 },
  { from: 'Vidrala HQ',    to: 'Vidroporto Nordeste',  amount:   700_000 },
  { from: 'Gallo Vidro',   to: 'Encirc Derrylin',      amount:   600_000 },
  { from: 'Aiala Vidrio',  to: 'Castellar Vidrio',     amount:   500_000 },
  { from: 'Gallo Vidro',   to: 'Vidroporto Nordeste',  amount:   400_000 },
  { from: 'Vidrala HQ',    to: 'Castellar Vidrio',     amount:   350_000 },
  { from: 'Aiala Vidrio',  to: 'Vidroporto Sudeste',   amount:   300_000 },
  { from: 'Gallo Vidro',   to: 'SB Vidros',            amount:   250_000 },
];

const NETTING_NETO = [
  { from: 'Pool HQ', to: 'Encirc UK',           amount: 5_000_000 },
  { from: 'Pool HQ', to: 'Encirc Derrylin',     amount: 1_500_000 },
  { from: 'Pool HQ', to: 'Vidroporto Sudeste',  amount: 1_200_000 },
  { from: 'Pool HQ', to: 'Vidroporto Nordeste', amount: 1_350_000 },
];

interface SweepingSimulatorProps {
  compact?: boolean;
  onPhaseChange?: (phase: 'idle' | 'sweeping' | 'netting' | 'done') => void;
}

export function SweepingSimulator({ compact, onPhaseChange }: SweepingSimulatorProps = {}) {
  const { dispatch } = useTreasury();
  const [phase, setPhase] = useState<'idle' | 'sweeping' | 'netting' | 'done'>('idle');
  const [progress, setProgress] = useState(0);
  const [txHash] = useState(shortHash());
  const [contractAddr] = useState(shortAddr());
  const [elapsed, setElapsed] = useState(0);

  async function start() {
    setPhase('sweeping');
    onPhaseChange?.('sweeping');
    setProgress(0);
    setElapsed(0);
    const startTime = Date.now();

    for (let i = 1; i <= 20; i++) {
      await new Promise((r) => setTimeout(r, 200));
      setProgress(i * 5);
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
      dispatch({ type: 'SWEEP_TICK', fraction: 0.05 });
    }

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
  }

  const costeBruto = NETTING_BRUTO.length * CASO2.costeSwiftPorTransf;
  const costeNeto = NETTING_NETO.length * CASO2.costeStablecoinPorTransf;

  return (
    <div>
      {!compact && (
        <SectionTitle
          title="Smart Contract Sweeping — Ejecución en tiempo real"
          subtitle="Sweeping multilateral automatizado con netting. 12 transferencias brutas condensadas en 4 netas."
          source="Elaboración propia"
        />
      )}

      <div className="flex flex-wrap items-center gap-4 mb-6">
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
          <div className="flex items-center gap-2">
            <Loader className="w-4 h-4 text-[#3D9E63] animate-spin" />
            <span className="text-[#3D9E63] text-sm">Sweeping en curso… {elapsed}s</span>
          </div>
        )}
        {phase === 'netting' && (
          <div className="flex items-center gap-2">
            <Loader className="w-4 h-4 text-blue-400 animate-spin" />
            <span className="text-blue-400 text-sm">Calculando netting multilateral…</span>
          </div>
        )}
        {phase === 'done' && (
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span className="text-green-400 text-sm font-semibold">Sweep completado en {elapsed}s · Saldos del mapa actualizados</span>
          </div>
        )}
      </div>

      {/* Progress */}
      {phase !== 'idle' && (
        <div className="mb-6">
          <div className="bg-[#193D2A] rounded-full h-2 mb-1">
            <motion.div
              className="bg-[#3D9E63] h-2 rounded-full shadow-[0_0_8px_rgba(61,158,99,0.5)]"
              animate={{ width: `${phase === 'done' ? 100 : progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <div className="flex justify-between text-[#7A9B88] text-xs">
            <span>Fondos redistribuidos</span>
            <span>{phase === 'done' ? '100' : progress}%</span>
          </div>
        </div>
      )}

      {/* Smart contract info */}
      {phase !== 'idle' && (
        <div className="bg-[#193D2A]/40 border border-[#193D2A] rounded-lg p-4 mb-6 text-xs font-mono">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div><span className="text-[#7A9B88]">Contrato: </span><span className="text-[#3D9E63] break-all">{contractAddr.slice(0, 22)}…</span></div>
            <div><span className="text-[#7A9B88]">Tx hash: </span><span className="text-[#3D9E63] break-all">{txHash.slice(0, 22)}…</span></div>
            <div><span className="text-[#7A9B88]">Red: </span><span className="text-white">Polygon (MATIC)</span></div>
            <div><span className="text-[#7A9B88]">Gas: </span><span className="text-white">{CASO2.gasUsadoGwei} MATIC (~$0.0003)</span></div>
          </div>
        </div>
      )}

      {/* Netting comparison */}
      <div className={`grid gap-4 mb-6 ${compact ? 'grid-cols-2' : 'grid-cols-1 md:grid-cols-2 gap-6'}`}>
        {/* Bruto */}
        <div className="bg-[#193D2A] rounded-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold text-sm">Transferencias brutas (SWIFT)</h3>
            <span className="text-red-400 text-xs font-semibold">{NETTING_BRUTO.length} transfers · {eur(costeBruto)}</span>
          </div>
          <div className="space-y-1.5 max-h-72 overflow-y-auto">
            {NETTING_BRUTO.map((t, i) => (
              <div key={i} className={`flex items-center justify-between text-xs py-1.5 px-2 rounded ${phase === 'done' ? 'opacity-40 line-through' : ''}`}>
                <span className="text-[#7A9B88]">{t.from}</span>
                <ArrowRight className="w-3 h-3 text-[#7A9B88] mx-1 shrink-0" />
                <span className="text-[#7A9B88]">{t.to}</span>
                <span className="text-white font-mono ml-auto pl-2">{eur(t.amount / 1_000_000, 2)}M€</span>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-[#0A2116] flex justify-between text-sm">
            <span className="text-[#7A9B88]">Coste total</span>
            <span className="text-red-400 font-semibold">{eur(costeBruto)}</span>
          </div>
        </div>

        {/* Neto */}
        <div className="bg-[#193D2A] rounded-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold text-sm">Transferencias netas (Stablecoin)</h3>
            <span className="text-green-400 text-xs font-semibold">{NETTING_NETO.length} transfers · ${(costeNeto).toFixed(2)}</span>
          </div>
          <div className="space-y-1.5">
            {NETTING_NETO.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: phase !== 'idle' ? 1 : 0, x: 0 }}
                transition={{ delay: i * 0.3 }}
                className="flex items-center justify-between text-xs py-1.5 px-2 rounded bg-green-900/20 border border-green-800/30"
              >
                <span className="text-green-300">{t.from}</span>
                <ArrowRight className="w-3 h-3 text-green-400 mx-1 shrink-0" />
                <span className="text-green-300">{t.to}</span>
                <span className="text-white font-mono ml-auto pl-2">{eur(t.amount / 1_000_000, 2)}M€</span>
              </motion.div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-[#0A2116] flex justify-between text-sm">
            <span className="text-[#7A9B88]">Coste total</span>
            <span className="text-green-400 font-semibold">${costeNeto.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Summary */}
      <AnimatePresence>
        {phase === 'done' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-900/15 border border-green-700/40 rounded-xl p-6"
          >
            <h3 className="text-green-400 font-bold text-lg mb-4">Resultado del sweep</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-[#7A9B88] text-xs mb-1">Transferencias</div>
                <div className="text-white font-bold text-xl">{NETTING_BRUTO.length} → {NETTING_NETO.length}</div>
                <div className="text-green-400 text-xs">−{Math.round((1 - NETTING_NETO.length / NETTING_BRUTO.length) * 100)}% operaciones</div>
              </div>
              <div>
                <div className="text-[#7A9B88] text-xs mb-1">Coste SWIFT</div>
                <div className="text-red-400 font-bold text-xl line-through">{eur(costeBruto)}</div>
                <div className="text-[#7A9B88] text-xs">+ 48h de espera</div>
              </div>
              <div>
                <div className="text-[#7A9B88] text-xs mb-1">Coste stablecoin</div>
                <div className="text-green-400 font-bold text-xl">${costeNeto.toFixed(2)}</div>
                <div className="text-green-400 text-xs">{elapsed}s de ejecución</div>
              </div>
              <div>
                <div className="text-[#7A9B88] text-xs mb-1">Ahorro por ciclo</div>
                <div className="text-[#3D9E63] font-bold text-xl">{eur(costeBruto - costeNeto)}</div>
                <div className="text-[#3D9E63] text-xs">&gt;99.99% reducción</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
