import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart2, TrendingUp, Globe, Banknote } from 'lucide-react';
import { DiagnosticoPanel as DiagnosticoI } from '../components/caso1/DiagnosticoPanel';
import { ComparativaInteractiva } from '../components/caso1/ComparativaInteractiva';
import { ViabilidadTCO as TCOI } from '../components/caso1/ViabilidadTCO';
import { DiagnosticoPanel as DiagnosticoII } from '../components/caso2/DiagnosticoPanel';
import { ViabilidadTCO as TCOII } from '../components/caso2/ViabilidadTCO';
import { CASO1, CASO2 } from '../lib/constants';
import { eur, pct } from '../lib/format';

const TABS = [
  { id: 'diagnostico', label: '1. Diagnóstico', icon: BarChart2 },
  { id: 'comparativa', label: '2. Comparativa interactiva', icon: TrendingUp },
  { id: 'tco', label: '3. Viabilidad TCO', icon: Globe },
];

const tabVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.2 } },
  exit: { opacity: 0, y: -6, transition: { duration: 0.15 } },
};

const kpis = [
  { label: 'Ahorro Caso I (anual)', value: eur(CASO1.ahorroAnual), sub: `${pct(CASO1.ahorroPct)} reducción`, icon: TrendingUp },
  { label: 'Payback Caso I', value: `${CASO1.paybackDias} días`, sub: `ROI 12m: ${CASO1.roi12m}%`, icon: BarChart2 },
  { label: 'Ahorro Caso II (anual)', value: eur(CASO2.ahorroAnual), sub: `${pct(CASO2.ahorroPct)} reducción`, icon: TrendingUp },
  { label: 'Payback Caso II', value: `${CASO2.paybackDias} días`, sub: `ROI 12m: ${CASO2.roi12m}%`, icon: Banknote },
];

const casoVariants = {
  initial: { opacity: 0, x: 10 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.18 } },
  exit: { opacity: 0, x: -8, transition: { duration: 0.12 } },
};

const CASOS = [
  { id: 'caso1', label: 'Caso I', sub1: 'Transferencias Internacionales', sub2: 'TCO Transferencias' },
  { id: 'caso2', label: 'Caso II', sub1: 'Cross Border Cash Pooling', sub2: 'TCO Cash Pooling' },
];

export function Analisis() {
  const [tab, setTab] = useState('diagnostico');
  const [casoTab, setCasoTab] = useState<'caso1' | 'caso2'>('caso1');

  return (
    <main className="max-w-7xl mx-auto px-6 py-10">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[#7A9B88] text-xs border border-[#193D2A] rounded px-2 py-0.5">Análisis</span>
          <span className="text-[#7A9B88] text-xs">Viabilidad Económica · Vidrala S.A.</span>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Análisis de Viabilidad</h1>
        <p className="text-[#7A9B88] max-w-3xl">
          Diagnóstico de la situación actual, análisis comparativo por volumen y modelo de Coste Total
          de Propiedad para los dos casos de uso de stablecoins en tesorería corporativa.
        </p>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {kpis.map(({ label, value, sub, icon: Icon }) => (
          <div key={label} className="relative bg-[#193D2A]/40 border border-[#193D2A] rounded-lg p-4 overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-[#3D9E63]/70 rounded-t-lg" />
            <div className="text-[#3D9E63] mb-2"><Icon className="w-4 h-4" /></div>
            <div className="text-white font-bold text-xl">{value}</div>
            <div className="text-[#22C55E] text-xs font-semibold mt-0.5">{sub}</div>
            <div className="text-[#7A9B88] text-xs mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 mb-8 border-b border-[#193D2A] pb-0">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors border-b-2 ${
              tab === id
                ? 'text-white border-[#3D9E63] bg-[#193D2A]/40'
                : 'text-[#7A9B88] border-transparent hover:text-white hover:bg-[#193D2A]/20'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div key={tab} {...tabVariants}>
          {tab === 'diagnostico' && (
            <div>
              <div className="flex border-b border-[#193D2A] mb-6">
                {CASOS.map(({ id, label, sub1 }) => (
                  <button
                    key={id}
                    onClick={() => setCasoTab(id as 'caso1' | 'caso2')}
                    className={`flex items-center gap-2 px-5 py-2.5 text-sm font-medium transition-colors border-b-2 ${
                      casoTab === id
                        ? 'text-white border-[#3D9E63] bg-[#193D2A]/30'
                        : 'text-[#7A9B88] border-transparent hover:text-white hover:bg-[#193D2A]/20'
                    }`}
                  >
                    <span className="text-xs font-semibold uppercase tracking-widest border border-current rounded px-1.5 py-0.5 opacity-70">{label}</span>
                    {sub1}
                  </button>
                ))}
              </div>
              <AnimatePresence mode="wait">
                <motion.div key={`diag-${casoTab}`} {...casoVariants}>
                  {casoTab === 'caso1' ? <DiagnosticoI /> : <DiagnosticoII />}
                </motion.div>
              </AnimatePresence>
            </div>
          )}
          {tab === 'comparativa' && (
            <div>
              <div className="flex items-center gap-2 mb-5">
                <span className="text-[#3D9E63] text-xs font-semibold uppercase tracking-widest border border-[#3D9E63]/40 bg-[#3D9E63]/10 rounded px-2 py-0.5">Caso I</span>
                <span className="text-[#7A9B88] text-sm">Análisis de sensibilidad por volumen operativo</span>
              </div>
              <ComparativaInteractiva />
            </div>
          )}
          {tab === 'tco' && (
            <div>
              <div className="flex border-b border-[#193D2A] mb-6">
                {CASOS.map(({ id, label, sub2 }) => (
                  <button
                    key={id}
                    onClick={() => setCasoTab(id as 'caso1' | 'caso2')}
                    className={`flex items-center gap-2 px-5 py-2.5 text-sm font-medium transition-colors border-b-2 ${
                      casoTab === id
                        ? 'text-white border-[#3D9E63] bg-[#193D2A]/30'
                        : 'text-[#7A9B88] border-transparent hover:text-white hover:bg-[#193D2A]/20'
                    }`}
                  >
                    <span className="text-xs font-semibold uppercase tracking-widest border border-current rounded px-1.5 py-0.5 opacity-70">{label}</span>
                    {sub2} · CAPEX {id === 'caso1' ? eur(CASO1.capex) : eur(CASO2.capex)}
                  </button>
                ))}
              </div>
              <AnimatePresence mode="wait">
                <motion.div key={`tco-${casoTab}`} {...casoVariants}>
                  {casoTab === 'caso1' ? <TCOI /> : <TCOII />}
                </motion.div>
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Tab navigation */}
      <div className="flex justify-between mt-10 pt-6 border-t border-[#193D2A]">
        <button
          onClick={() => {
            const idx = TABS.findIndex((t) => t.id === tab);
            if (idx > 0) setTab(TABS[idx - 1].id);
          }}
          disabled={tab === TABS[0].id}
          className="px-4 py-2 text-sm text-[#7A9B88] border border-[#193D2A] rounded-lg hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          ← Anterior
        </button>
        <button
          onClick={() => {
            const idx = TABS.findIndex((t) => t.id === tab);
            if (idx < TABS.length - 1) setTab(TABS[idx + 1].id);
          }}
          disabled={tab === TABS[TABS.length - 1].id}
          className="px-4 py-2 text-sm bg-[#193D2A] text-white border border-[#193D2A] rounded-lg hover:border-[#3D9E63]/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          Siguiente →
        </button>
      </div>
    </main>
  );
}
