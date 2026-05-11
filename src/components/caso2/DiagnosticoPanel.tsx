import { BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { KPICard } from '../ui/KPICard';
import { SectionTitle } from '../ui/SectionTitle';
import { CASO2 } from '../../lib/constants';
import { eur } from '../../lib/format';

const comparativa = [
  { name: 'Modelo bancario', valor: CASO2.costeAnualTradicional, fill: '#EF4444' },
  { name: 'Stablecoin pool', valor: CASO2.costeAnualStablecoin, fill: '#22C55E' },
];

export function DiagnosticoPanel() {
  return (
    <div>
      <SectionTitle
        title="Diagnóstico — Estado actual"
        subtitle="Operativa de cash pooling cross-border vía banca tradicional vs. smart contract stablecoin sobre 120M€ de volumen"
        source="Elaboración propia"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KPICard
          label="Capital inmovilizado"
          after="−40%"
          delta="Reducción por sweeping automático 24/7"
          positive
          source="Elaboración propia"
        />
        <KPICard
          label="Transferencias físicas"
          before="12 brutas"
          after="4 netas"
          delta="−60% por netting multilateral"
          positive
          source="Elaboración propia"
        />
        <KPICard
          label="Visibilidad de saldos"
          before="T+1 / T+2"
          after="Tiempo real 24/7"
          delta="Datos on-chain en segundos"
          positive
          source="Elaboración propia"
        />
        <KPICard
          label="Coste anual (120M€)"
          before={eur(CASO2.costeAnualTradicional)}
          after={eur(CASO2.costeAnualStablecoin)}
          delta={`Ahorro ${eur(CASO2.ahorroAnual)} (${CASO2.ahorroPct}%)`}
          positive
          source="Elaboración propia"
        />
      </div>

      <div className="bg-[#193D2A] rounded-lg p-6">
        <h3 className="text-white font-semibold mb-1">Coste operativo anual comparado</h3>
        <p className="text-[#7A9B88] text-xs mb-5">Modelo bancario tradicional vs. pool de stablecoins con sweeping automatizado</p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={comparativa} layout="vertical" margin={{ left: 16, right: 32 }}>
            <XAxis type="number" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k€`} tick={{ fill: '#7A9B88', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="name" tick={{ fill: '#7A9B88', fontSize: 12 }} axisLine={false} tickLine={false} width={120} />
            <Tooltip
              formatter={(v: unknown) => [eur(v as number), 'Coste anual']}
              contentStyle={{ background: '#0A2116', border: '1px solid #193D2A', borderRadius: 6 }}
              labelStyle={{ color: '#fff' }}
              itemStyle={{ color: '#7A9B88' }}
            />
            <Bar dataKey="valor" radius={[0, 4, 4, 0]}>
              {comparativa.map((entry) => (
                <Cell key={entry.name} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
