import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine,
} from 'recharts';
import { SectionTitle } from '../ui/SectionTitle';
import { KPICard } from '../ui/KPICard';
import { CASO1 } from '../../lib/constants';
import { eur } from '../../lib/format';

const tcoData = Array.from({ length: 13 }, (_, i) => {
  const mes = i;
  const costoStablecoin = CASO1.capex + CASO1.opexAnual * (mes / 12);
  const costoTradicional = CASO1.costeAnualTradicional * (mes / 12);
  const ahorroNeto = costoTradicional - costoStablecoin;
  return { mes: mes === 0 ? 'Inicio' : `M${mes}`, costoStablecoin, costoTradicional, ahorroNeto };
});

const paybackMes = Math.ceil((CASO1.paybackDias / 30));

export function ViabilidadTCO() {
  return (
    <div>
      <SectionTitle
        title="Estudio de viabilidad económica — TCO"
        subtitle="Total Cost of Ownership a 12 meses comparado entre modelo tradicional y stablecoin"
        source="Elaboración propia"
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <KPICard label="CAPEX (implementación)" after={eur(CASO1.capex)} source="Elaboración propia" />
        <KPICard label="OPEX anual (recurrente)" after={eur(CASO1.opexAnual)} source="Elaboración propia" />
        <KPICard label="Ahorro anual (50M€)" after={eur(CASO1.ahorroAnual)} delta={`+${CASO1.ahorroPct}% sobre modelo SWIFT`} positive source="Elaboración propia" />
        <KPICard label="Payback" after={`${CASO1.paybackDias} días`} delta={`ROI 12m: ${CASO1.roi12m}%`} positive source="Elaboración propia" />
      </div>

      <div className="bg-[#193D2A] rounded-lg p-6">
        <h3 className="text-white font-semibold mb-1">Curva TCO acumulado a 12 meses</h3>
        <p className="text-[#7A9B88] text-xs mb-5">El modelo stablecoin supera al modelo SWIFT en el mes {paybackMes} (payback de {CASO1.paybackDias} días)</p>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={tcoData}>
            <defs>
              <linearGradient id="swift" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="stable" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22C55E" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#0A2116" />
            <XAxis dataKey="mes" tick={{ fill: '#7A9B88', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}k€`}
              tick={{ fill: '#7A9B88', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              formatter={(v: unknown, name: unknown) => [
                eur(v as number),
                name === 'costoTradicional' ? 'SWIFT acumulado' : name === 'costoStablecoin' ? 'Stablecoin acumulado' : 'Ahorro neto',
              ]}
              contentStyle={{ background: '#0A2116', border: '1px solid #193D2A', borderRadius: 6 }}
              labelStyle={{ color: '#fff' }}
              itemStyle={{ color: '#7A9B88' }}
            />
            <ReferenceLine
              x={`M${paybackMes}`}
              stroke="#3D9E63"
              strokeDasharray="4 4"
              label={{ value: `Payback M${paybackMes}`, fill: '#3D9E63', fontSize: 11 }}
            />
            <Area type="monotone" dataKey="costoTradicional" stroke="#EF4444" fill="url(#swift)" strokeWidth={2} />
            <Area type="monotone" dataKey="costoStablecoin" stroke="#22C55E" fill="url(#stable)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Coste tradicional año 1', value: eur(CASO1.costeAnualTradicional), color: 'text-red-400' },
          { label: 'Coste stablecoin año 1 (incl. CAPEX)', value: eur(CASO1.capex + CASO1.costeAnualStablecoin), color: 'text-green-400' },
          { label: 'Ahorro neto año 1', value: eur(CASO1.ahorroAnual - CASO1.capex - CASO1.costeAnualStablecoin), color: 'text-[#3D9E63]' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-[#193D2A]/40 border border-[#193D2A] rounded-lg p-4">
            <div className="text-[#7A9B88] text-xs mb-1">{label}</div>
            <div className={`font-bold text-lg ${color}`}>{value}</div>
            <div className="text-[#7A9B88] text-[10px] mt-1">Fuente: elaboración propia</div>
          </div>
        ))}
      </div>
    </div>
  );
}
