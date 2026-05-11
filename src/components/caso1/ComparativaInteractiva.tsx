import { useState, useMemo } from 'react';
import {
  BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid, Legend,
} from 'recharts';
import { SectionTitle } from '../ui/SectionTitle';
import { KPICard } from '../ui/KPICard';
import { CASO1 } from '../../lib/constants';
import { eur, pct } from '../../lib/format';

export function ComparativaInteractiva() {
  const [volumen, setVolumen] = useState(50);

  const vol = volumen * 1_000_000;
  const costeTradicional = Math.round(vol * CASO1.tasaTradicionalBps / 10_000);
  const costeStablecoin = Math.round(CASO1.stablecoinFixedCost + vol * CASO1.stablecoinVariableBps / 10_000);
  const ahorro = costeTradicional - costeStablecoin;
  const ahorroPct = (ahorro / costeTradicional) * 100;
  const breakEvenVol = Math.round(CASO1.stablecoinFixedCost / ((CASO1.tasaTradicionalBps - CASO1.stablecoinVariableBps) / 10_000));
  const superaBreakEven = ahorro > 0;
  const payback = superaBreakEven ? Math.round(CASO1.capex / (ahorro / 365)) : null;

  const ahorroAcumulado = useMemo(() =>
    Array.from({ length: 12 }, (_, i) => ({
      mes: `M${i + 1}`,
      tradicional: Math.round(costeTradicional * (i + 1) / 12),
      stablecoin: Math.round(costeStablecoin * (i + 1) / 12) + CASO1.capex,
      ahorro: Math.round(ahorro * (i + 1) / 12) - CASO1.capex,
    })),
    [costeTradicional, costeStablecoin, ahorro]
  );

  const comparativa = [
    { name: 'Modelo SWIFT', value: costeTradicional, fill: '#EF4444' },
    { name: 'Stablecoin', value: costeStablecoin, fill: '#22C55E' },
  ];

  return (
    <div>
      <SectionTitle
        title="Comparativa interactiva de costes"
        subtitle="Ajusta el volumen anual operado para ver el impacto en tiempo real"
        source="Elaboración propia"
      />

      <div className="bg-[#193D2A] rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-white font-medium">Volumen anual operado</span>
          <span className="text-[#3D9E63] font-bold text-xl">{eur(vol)}</span>
        </div>
        <input
          type="range"
          min={1}
          max={200}
          value={volumen}
          onChange={(e) => setVolumen(Number(e.target.value))}
          className="w-full accent-[#3D9E63]"
        />
        <div className="flex justify-between text-[#7A9B88] text-xs mt-1">
          <span>1M€</span>
          <span>200M€</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <KPICard label="Coste SWIFT" after={eur(costeTradicional)} source="Elaboración propia" />
        <KPICard label="Coste Stablecoin" after={eur(costeStablecoin)} positive={superaBreakEven} source="Elaboración propia" />
        <KPICard
          label="Ahorro anual"
          after={superaBreakEven ? eur(ahorro) : '—'}
          delta={superaBreakEven ? pct(ahorroPct) : `Break-even: ${eur(breakEvenVol)}`}
          positive={superaBreakEven}
          source="Elaboración propia"
        />
        <KPICard
          label="Payback estimado"
          after={payback !== null ? `${payback} días` : 'N/A'}
          delta={payback === null ? `Activa sobre ${eur(breakEvenVol)}` : undefined}
          positive={payback !== null}
          source="Elaboración propia"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#193D2A] rounded-lg p-6">
          <h3 className="text-white font-semibold mb-4">Coste anual comparado</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={comparativa}>
              <XAxis dataKey="name" tick={{ fill: '#7A9B88', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k€`} tick={{ fill: '#7A9B88', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                formatter={(v: unknown) => [eur(v as number), 'Coste anual']}
                contentStyle={{ background: '#0A2116', border: '1px solid #193D2A', borderRadius: 6 }}
                labelStyle={{ color: '#fff' }}
                itemStyle={{ color: '#7A9B88' }}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {comparativa.map((entry) => (
                  <Cell key={entry.name} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-[#193D2A] rounded-lg p-6">
          <h3 className="text-white font-semibold mb-4">Ahorro acumulado a 12 meses</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={ahorroAcumulado}>
              <CartesianGrid strokeDasharray="3 3" stroke="#193D2A" />
              <XAxis dataKey="mes" tick={{ fill: '#7A9B88', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k€`} tick={{ fill: '#7A9B88', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                formatter={(v: unknown, name: unknown) => [eur(v as number), name === 'ahorro' ? 'Ahorro neto' : name === 'tradicional' ? 'SWIFT acumulado' : 'Stablecoin acumulado']}
                contentStyle={{ background: '#0A2116', border: '1px solid #193D2A', borderRadius: 6 }}
                labelStyle={{ color: '#fff' }}
                itemStyle={{ color: '#7A9B88' }}
              />
              <Legend formatter={(v) => v === 'ahorro' ? 'Ahorro neto' : v === 'tradicional' ? 'SWIFT' : 'Stablecoin'} />
              <Line type="monotone" dataKey="tradicional" stroke="#EF4444" dot={false} strokeWidth={2} />
              <Line type="monotone" dataKey="stablecoin" stroke="#22C55E" dot={false} strokeWidth={2} />
              <Line type="monotone" dataKey="ahorro" stroke="#F59E0B" dot={false} strokeWidth={2} strokeDasharray="5 5" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
