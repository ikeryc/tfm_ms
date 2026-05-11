import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { KPICard } from '../ui/KPICard';
import { SectionTitle } from '../ui/SectionTitle';
import { CASO1 } from '../../lib/constants';
import { eur } from '../../lib/format';

const breakdown = [
  { name: 'Comisiones + FX', value: CASO1.costeComisionesYFX, color: '#EF4444' },
  { name: 'Personal Recop.', value: CASO1.costePersonalReconciliacion, color: '#F97316' },
  { name: 'Coste Oportunidad', value: CASO1.costeOportunidad, color: '#EAB308' },
];

export function DiagnosticoPanel() {
  return (
    <div>
      <SectionTitle
        title="Diagnóstico — Estado actual"
        subtitle="Operativa de pagos internacionales vía SWIFT/banca corresponsal vs. stablecoins sobre 50M€ de volumen anual"
        source="Elaboración propia"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <KPICard
          label="Tiempo de liquidación"
          before="1–5 días hábiles"
          after="< 5 minutos"
          delta="Reducción > 99%"
          positive
          source="Elaboración propia"
        />
        <KPICard
          label="Coste anual (50M€ volumen)"
          before={eur(CASO1.costeAnualTradicional)}
          after={eur(CASO1.costeAnualStablecoin)}
          delta={`Ahorro ${eur(CASO1.ahorroAnual)} (${CASO1.ahorroPct}%)`}
          positive
          source="Elaboración propia"
        />
        <KPICard
          label="Disponibilidad operativa"
          before="Horario bancario"
          after="24 / 7 / 365"
          delta="Sin restricción horaria ni geográfica"
          positive
          source="Elaboración propia"
        />
      </div>

      <div className="bg-[#193D2A] rounded-lg p-6">
        <h3 className="text-white font-semibold mb-1">Desglose del coste tradicional</h3>
        <p className="text-[#7A9B88] text-xs mb-5">Distribución de las {eur(CASO1.costeAnualTradicional)} anuales de coste en el modelo SWIFT (50M€ volumen)</p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={breakdown} layout="vertical" margin={{ left: 16, right: 32 }}>
            <XAxis
              type="number"
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}k€`}
              tick={{ fill: '#7A9B88', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fill: '#7A9B88', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              width={100}
            />
            <Tooltip
              formatter={(v: unknown) => [eur(v as number), 'Coste anual']}
              contentStyle={{ background: '#0A2116', border: '1px solid #193D2A', borderRadius: 6 }}
              labelStyle={{ color: '#fff' }}
              itemStyle={{ color: '#7A9B88' }}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
              {breakdown.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
