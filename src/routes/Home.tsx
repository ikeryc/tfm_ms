import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Banknote, Globe, TrendingUp, ShieldCheck, BarChart2, Zap } from 'lucide-react';
import { CASO1, CASO2 } from '../lib/constants';
import { eur, pct } from '../lib/format';
import { useStablecoinPrices } from '../hooks/useStablecoinPrices';

const statsVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const statItem = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export function Home() {
  const { prices, live } = useStablecoinPrices();

  const stablecoins = [
    { id: 'usd-coin', label: 'USDC' },
    { id: 'euro-coin', label: 'EURC' },
    { id: 'tether', label: 'USDT' },
  ];

  return (
    <main className="max-w-7xl mx-auto px-6 py-12">
      {/* Hero */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 bg-[#3D9E63]/10 border border-[#3D9E63]/30 rounded-full px-4 py-1.5 mb-6">
          <span className="text-[#3D9E63] text-xs font-semibold uppercase tracking-widest">Trabajo de Fin de Máster · 2026</span>
        </div>
        <h1 className="text-4xl font-bold mb-4 leading-tight">
          <span className="bg-gradient-to-r from-white via-white to-[#3D9E63] bg-clip-text text-transparent">
            Criptodivisas: identificación de casos de
          </span>
          <br />
          <span className="text-white">uso viables en el ámbito de Tesorería</span>
        </h1>
        <p className="text-[#7A9B88] text-lg max-w-2xl mx-auto">
          Análisis de viabilidad operativa y económica de stablecoins en tesorería corporativa.
          Dos casos de uso reales aplicados a Vidrala S.A.
        </p>
      </div>

      {/* Stablecoin prices live */}
      <div className="bg-[#193D2A]/50 border border-[#193D2A] rounded-lg p-4 mb-12 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${live ? 'bg-green-400 animate-pulse shadow-[0_0_6px_#4ade80]' : 'bg-[#7A9B88]'}`} />
          <span className="text-[#7A9B88] text-xs">{live ? 'Precios en tiempo real' : 'Precios de referencia'}</span>
        </div>
        <div className="flex flex-wrap gap-6">
          {stablecoins.map(({ id, label }) => {
            const p = prices?.[id];
            const isEurc = id === 'euro-coin';
            const pegPrice = isEurc ? (p?.eur ?? 1.0000) : (p?.usd ?? 1.0000);
            const deviation = Math.abs(pegPrice - 1.0) * 100;
            const stable = deviation < 0.5;
            return (
              <div key={id} className="flex items-center gap-2">
                <span className="text-[#7A9B88] text-sm">{label}</span>
                <span className="text-white font-mono text-sm">{isEurc ? '€' : '$'}{pegPrice.toFixed(4)}</span>
                <span className={`text-xs font-semibold ${stable ? 'text-green-400' : 'text-yellow-400'}`}>
                  {stable ? 'PEG ✓' : `Δ${deviation.toFixed(2)}%`}
                </span>
              </div>
            );
          })}
        </div>
        <span className="text-[#7A9B88] text-[10px]">Fuente: CoinGecko{live ? ' (live)' : ' (fallback)'}</span>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {/* Caso I */}
        <motion.div whileHover={{ scale: 1.015 }} transition={{ duration: 0.15 }}>
          <div className="group relative bg-[#193D2A] border border-[#193D2A] hover:border-[#3D9E63]/50 rounded-xl p-8 transition-all duration-200 h-full">
            <div className="absolute left-0 top-4 bottom-4 w-0.5 bg-transparent group-hover:bg-[#3D9E63] transition-all duration-200 rounded-full" />
            <div className="flex items-start justify-between mb-6">
              <div className="w-12 h-12 bg-[#3D9E63]/15 rounded-lg flex items-center justify-center">
                <Globe className="w-6 h-6 text-[#3D9E63]" />
              </div>
              <span className="text-[#7A9B88] text-xs border border-[#193D2A] rounded px-2 py-0.5">Caso I</span>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Transferencias Internacionales</h2>
            <p className="text-[#7A9B88] text-sm mb-6">
              Sustitución de SWIFT/banca corresponsal por stablecoins para pagos cross-border corporativos.
            </p>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <div className="text-[#7A9B88] text-xs mb-1">Ahorro anual (50M€)</div>
                <div className="text-white font-bold text-lg">{eur(CASO1.ahorroAnual)}</div>
                <div className="text-green-400 text-xs font-semibold">{pct(CASO1.ahorroPct)} reducción</div>
              </div>
              <div>
                <div className="text-[#7A9B88] text-xs mb-1">Payback</div>
                <div className="text-[#3D9E63] font-bold text-lg">{CASO1.paybackDias} días</div>
                <div className="text-[#7A9B88] text-xs">ROI 12m: {CASO1.roi12m}%</div>
              </div>
            </div>
            <div className="flex gap-3 mt-auto">
              <Link to="/analisis" className="flex items-center gap-1.5 text-[#7A9B88] text-sm font-medium hover:text-white transition-colors border border-[#193D2A] hover:border-[#3D9E63]/40 px-3 py-1.5 rounded-lg">
                <BarChart2 className="w-3.5 h-3.5" /> Ver análisis
              </Link>
              <Link to="/demo" className="flex items-center gap-1.5 text-[#3D9E63] text-sm font-medium hover:text-white transition-colors group-hover:gap-2">
                <Zap className="w-3.5 h-3.5" /> Ver demo <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Caso II */}
        <motion.div whileHover={{ scale: 1.015 }} transition={{ duration: 0.15 }}>
          <div className="group relative bg-[#193D2A] border border-[#193D2A] hover:border-[#3D9E63]/50 rounded-xl p-8 transition-all duration-200 h-full">
            <div className="absolute left-0 top-4 bottom-4 w-0.5 bg-transparent group-hover:bg-[#3D9E63] transition-all duration-200 rounded-full" />
            <div className="flex items-start justify-between mb-6">
              <div className="w-12 h-12 bg-[#3D9E63]/15 rounded-lg flex items-center justify-center">
                <Banknote className="w-6 h-6 text-[#3D9E63]" />
              </div>
              <span className="text-[#7A9B88] text-xs border border-[#193D2A] rounded px-2 py-0.5">Caso II</span>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Cross Border Cash Pooling</h2>
            <p className="text-[#7A9B88] text-sm mb-6">
              Sweeping multilateral automatizado vía smart contract entre plantas de Vidrala S.A.
            </p>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <div className="text-[#7A9B88] text-xs mb-1">Ahorro anual (120M€)</div>
                <div className="text-white font-bold text-lg">{eur(CASO2.ahorroAnual)}</div>
                <div className="text-green-400 text-xs font-semibold">{pct(CASO2.ahorroPct)} reducción</div>
              </div>
              <div>
                <div className="text-[#7A9B88] text-xs mb-1">Payback</div>
                <div className="text-[#3D9E63] font-bold text-lg">{CASO2.paybackDias} días</div>
                <div className="text-[#7A9B88] text-xs">ROI 12m: {CASO2.roi12m}%</div>
              </div>
            </div>
            <div className="flex gap-3 mt-auto">
              <Link to="/analisis" className="flex items-center gap-1.5 text-[#7A9B88] text-sm font-medium hover:text-white transition-colors border border-[#193D2A] hover:border-[#3D9E63]/40 px-3 py-1.5 rounded-lg">
                <BarChart2 className="w-3.5 h-3.5" /> Ver análisis
              </Link>
              <Link to="/demo" className="flex items-center gap-1.5 text-[#3D9E63] text-sm font-medium hover:text-white transition-colors group-hover:gap-2">
                <Zap className="w-3.5 h-3.5" /> Ver demo <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Summary stats with stagger animation */}
      <motion.div
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
        variants={statsVariants}
        initial="hidden"
        animate="visible"
      >
        {[
          { icon: <TrendingUp className="w-5 h-5" />, label: 'Ahorro combinado anual', value: eur(CASO1.ahorroAnual + CASO2.ahorroAnual) },
          { icon: <ShieldCheck className="w-5 h-5" />, label: 'Payback medio', value: `${Math.round((CASO1.paybackDias + CASO2.paybackDias) / 2)} días` },
          { icon: <Globe className="w-5 h-5" />, label: 'Reducción tiempo liquidación', value: '> 99%' },
          { icon: <Banknote className="w-5 h-5" />, label: 'Transferencias brutas → netas', value: '12 → 4' },
        ].map(({ icon, label, value }) => (
          <motion.div key={label} variants={statItem} className="relative bg-[#193D2A]/40 border border-[#193D2A] rounded-lg p-4 flex flex-col gap-2 overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-[#3D9E63]/50 rounded-t-lg" />
            <div className="text-[#3D9E63]">{icon}</div>
            <div className="text-white font-bold text-lg">{value}</div>
            <div className="text-[#7A9B88] text-xs">{label}</div>
          </motion.div>
        ))}
      </motion.div>
    </main>
  );
}
