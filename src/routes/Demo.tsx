import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Zap } from 'lucide-react';
import { FlowSimulator } from '../components/caso1/FlowSimulator';
import { MapaFiliales } from '../components/caso2/MapaFiliales';
import { SweepingSimulator } from '../components/caso2/SweepingSimulator';
import { FILIALES } from '../lib/constants';
import { useTreasury } from '../context/TreasuryContext';
import type { TransferFlowState, SweepFlowState } from '../types/flow';

const EMPTY_TRANSFER: TransferFlowState = { active: false, phase: 'idle', fromId: null, toId: null };
const EMPTY_SWEEP: SweepFlowState = { active: false, phase: 'idle', excedentIds: [], deficitIds: [], hqId: 'hq' };

const tabVariants = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.18 } },
  exit: { opacity: 0, y: -4, transition: { duration: 0.12 } },
};

export function Demo() {
  const { state } = useTreasury();
  const [activeOp, setActiveOp] = useState<'transfer' | 'sweep'>('transfer');
  const [transferFlow, setTransferFlow] = useState<TransferFlowState>(EMPTY_TRANSFER);
  const [sweepFlow, setSweepFlow] = useState<SweepFlowState>(EMPTY_SWEEP);

  function handleTransferPhase(
    phase: 'idle' | 'running' | 'done',
    stepIndex: number,
    fromId: string,
    toId: string,
  ) {
    if (stepIndex === 2) {
      setTransferFlow({ active: true, phase: 'transmitting', fromId, toId });
    } else if (stepIndex === 3) {
      setTransferFlow({ active: true, phase: 'confirming', fromId, toId });
    } else if (phase === 'done') {
      setTransferFlow((prev) => ({ ...prev, active: false, phase: 'done' }));
    } else if (phase === 'idle') {
      setTransferFlow(EMPTY_TRANSFER);
    }
  }

  function handleSweepPhase(phase: 'idle' | 'sweeping' | 'netting' | 'done') {
    if (phase === 'sweeping') {
      const excedentIds = FILIALES.filter(
        (f) => (state.balances[f.id] ?? f.balance) > f.target * 1.1,
      ).map((f) => f.id);
      const deficitIds = FILIALES.filter(
        (f) => (state.balances[f.id] ?? f.balance) < f.target * 0.9,
      ).map((f) => f.id);
      setSweepFlow({ active: true, phase: 'sweeping', excedentIds, deficitIds, hqId: 'hq' });
    } else if (phase === 'netting') {
      setSweepFlow((prev) => ({ ...prev, active: true, phase: 'netting' }));
    } else if (phase === 'done') {
      setSweepFlow((prev) => ({ ...prev, active: false, phase: 'done' }));
    } else {
      setSweepFlow(EMPTY_SWEEP);
    }
  }

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 57px)' }}>
      {/* Split pane */}
      <div className="flex flex-1 min-h-0">
        {/* Mapa — izquierda */}
        <div className="w-[55%] min-w-0 border-r border-[#193D2A]">
          <MapaFiliales transferFlow={transferFlow} sweepFlow={sweepFlow} />
        </div>

        {/* Panel de operaciones — derecha */}
        <div className="w-[45%] min-w-[420px] shrink-0 flex flex-col bg-[#0A2116] overflow-y-auto">
          {/* Header del panel */}
          <div className="px-5 pt-4 pb-3 border-b border-[#193D2A] shrink-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[#3D9E63] text-[10px] font-semibold uppercase tracking-widest border border-[#3D9E63]/40 bg-[#3D9E63]/10 rounded px-2 py-0.5">Demo</span>
              <span className="text-[#7A9B88] text-xs">Vidrala S.A.</span>
            </div>
            <p className="text-white font-semibold text-sm">Operaciones en tiempo real</p>
          </div>

          {/* Toggle Transferencia / Sweeping */}
          <div className="flex border-b border-[#193D2A] shrink-0">
            <button
              onClick={() => setActiveOp('transfer')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors border-b-2 ${
                activeOp === 'transfer'
                  ? 'text-white border-[#3D9E63] bg-[#193D2A]/30'
                  : 'text-[#7A9B88] border-transparent hover:text-white hover:bg-[#193D2A]/20'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              Transferencia
            </button>
            <button
              onClick={() => setActiveOp('sweep')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors border-b-2 ${
                activeOp === 'sweep'
                  ? 'text-white border-[#3D9E63] bg-[#193D2A]/30'
                  : 'text-[#7A9B88] border-transparent hover:text-white hover:bg-[#193D2A]/20'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              Sweeping
            </button>
          </div>

          {/* Descripción contextual */}
          <div className="px-5 pt-3 pb-2 shrink-0">
            <AnimatePresence mode="wait">
              {activeOp === 'transfer' ? (
                <motion.p key="desc-transfer" {...tabVariants} className="text-[#7A9B88] text-xs leading-relaxed">
                  Transferencia cross-border vía EURC sobre Polygon. El flujo se visualiza en el mapa durante los pasos on-chain.
                </motion.p>
              ) : (
                <motion.p key="desc-sweep" {...tabVariants} className="text-[#7A9B88] text-xs leading-relaxed">
                  Sweeping multilateral automatizado via smart contract. Las flechas del mapa muestran los flujos de consolidación y redistribución.
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Contenido del simulador */}
          <AnimatePresence mode="wait">
            <motion.div key={activeOp} {...tabVariants} className="px-5 pb-6 flex-1">
              {activeOp === 'transfer' ? (
                <FlowSimulator onPhaseChange={handleTransferPhase} />
              ) : (
                <SweepingSimulator onPhaseChange={handleSweepPhase} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
