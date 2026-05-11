import { Shield, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { SectionTitle } from '../ui/SectionTitle';
import { Badge } from '../ui/Badge';
import { shortHash } from '../../lib/format';

const operaciones = [
  { id: 'OPS-2026-0481', contrato: 'POOL-LLO-MASTER', contraparte: 'Encirc UK',           importe: '5.000.000 €', divisa: 'EURC', mica: 'Conforme', emir: 'Reportado', estado: 'done' },
  { id: 'OPS-2026-0482', contrato: 'POOL-LLO-MASTER', contraparte: 'Vidroporto Sudeste',  importe: '1.500.000 €', divisa: 'EURC', mica: 'Conforme', emir: 'Reportado', estado: 'done' },
  { id: 'OPS-2026-0483', contrato: 'POOL-LLO-MASTER', contraparte: 'Vidroporto Nordeste', importe: '1.200.000 €', divisa: 'EURC', mica: 'Conforme', emir: 'Pendiente', estado: 'pending' },
  { id: 'OPS-2026-0484', contrato: 'POOL-LLO-MASTER', contraparte: 'SB Vidros',           importe: '1.350.000 €', divisa: 'EURC', mica: 'Conforme', emir: 'Pendiente', estado: 'pending' },
  { id: 'OPS-2026-0479', contrato: 'POOL-LLO-MASTER', contraparte: 'Crisnova Vidrio',     importe: '4.200.000 €', divisa: 'EURC', mica: 'Conforme', emir: 'Reportado', estado: 'done' },
  { id: 'OPS-2026-0480', contrato: 'POOL-LLO-MASTER', contraparte: 'Gallo Vidro',         importe: '3.800.000 €', divisa: 'EURC', mica: 'Conforme', emir: 'Reportado', estado: 'done' },
].map((op) => ({ ...op, hash: shortHash() }));

export function ReportingPanel() {
  const reporteDentro = '14h 23m';
  const conformes = operaciones.filter((o) => o.mica === 'Conforme').length;
  const reportados = operaciones.filter((o) => o.emir === 'Reportado').length;

  return (
    <div>
      <SectionTitle
        title="Panel de Reporting Regulatorio — MiCA / EMIR"
        subtitle="Registro automatizado de operaciones de tesorería con stablecoins bajo normativa europea"
        source="Elaboración propia (datos simulados)"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-[#193D2A] border border-[#193D2A] rounded-lg p-4 flex items-center gap-4">
          <Shield className="w-8 h-8 text-[#3D9E63]" />
          <div>
            <div className="text-[#7A9B88] text-xs">Conformidad MiCA</div>
            <div className="text-white font-bold text-xl">{conformes}/{operaciones.length}</div>
            <div className="text-green-400 text-xs">Todas conformes</div>
          </div>
        </div>
        <div className="bg-[#193D2A] border border-[#193D2A] rounded-lg p-4 flex items-center gap-4">
          <CheckCircle className="w-8 h-8 text-green-400" />
          <div>
            <div className="text-[#7A9B88] text-xs">Reportes EMIR enviados</div>
            <div className="text-white font-bold text-xl">{reportados}/{operaciones.length}</div>
            <div className="text-[#7A9B88] text-xs">{operaciones.length - reportados} pendientes</div>
          </div>
        </div>
        <div className="bg-[#193D2A] border border-[#193D2A] rounded-lg p-4 flex items-center gap-4">
          <Clock className="w-8 h-8 text-blue-400" />
          <div>
            <div className="text-[#7A9B88] text-xs">Próximo reporte automático</div>
            <div className="text-white font-bold text-xl">{reporteDentro}</div>
            <div className="text-blue-400 text-xs">Envío a ESMA via API</div>
          </div>
        </div>
      </div>

      <div className="bg-[#193D2A] rounded-lg overflow-hidden">
        <div className="px-5 py-3 border-b border-[#0A2116] flex items-center justify-between">
          <span className="text-white font-semibold text-sm">Registro de operaciones</span>
          <span className="text-[#7A9B88] text-xs">Último ciclo de sweeping</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[#0A2116]">
                {['ID', 'Contrato', 'Contraparte', 'Importe', 'Divisa', 'MiCA', 'EMIR', 'Hash'].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-left text-[#7A9B88] font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {operaciones.map((op) => (
                <tr key={op.id} className="border-b border-[#0A2116] hover:bg-[#0A2116]/30 transition-colors">
                  <td className="px-4 py-2.5 text-white font-mono whitespace-nowrap">{op.id}</td>
                  <td className="px-4 py-2.5 text-[#7A9B88] whitespace-nowrap">{op.contrato}</td>
                  <td className="px-4 py-2.5 text-[#7A9B88] whitespace-nowrap">{op.contraparte}</td>
                  <td className="px-4 py-2.5 text-white font-mono whitespace-nowrap">{op.importe}</td>
                  <td className="px-4 py-2.5"><Badge variant="gold">{op.divisa}</Badge></td>
                  <td className="px-4 py-2.5"><Badge variant="success">{op.mica}</Badge></td>
                  <td className="px-4 py-2.5">
                    <Badge variant={op.emir === 'Reportado' ? 'success' : 'warning'}>{op.emir}</Badge>
                  </td>
                  <td className="px-4 py-2.5 text-[#3D9E63] font-mono">{op.hash.slice(0, 10)}…</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4 flex items-start gap-2 text-[#7A9B88] text-xs">
        <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
        <span>El reporting automático vía API a ESMA reduce el riesgo operacional de incumplimiento y elimina la necesidad de reporte manual. MiCA (Mercados de Criptoactivos) establece los requisitos de reporte para tokens de dinero electrónico (EMT) como EURC.</span>
      </div>
    </div>
  );
}
