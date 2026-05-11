interface KPICardProps {
  label: string;
  before?: string;
  after: string;
  delta?: string;
  positive?: boolean;
  source?: string;
  large?: boolean;
}

export function KPICard({ label, before, after, delta, positive = true, source, large }: KPICardProps) {
  return (
    <div className="relative bg-[#193D2A] border border-[#193D2A] rounded-lg p-5 flex flex-col gap-2 overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-[#3D9E63]/60 rounded-t-lg" />
      <span className="text-[#7A9B88] text-xs font-medium uppercase tracking-widest">{label}</span>
      {before && (
        <div className="flex items-center gap-2">
          <span className="text-[#7A9B88] text-sm line-through">{before}</span>
          <span className="text-[#7A9B88] text-sm">→</span>
        </div>
      )}
      <span className={`font-bold ${large ? 'text-3xl' : 'text-2xl'} text-white`}>{after}</span>
      {delta && (
        <span className={`text-sm font-semibold ${positive ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}>
          {delta}
        </span>
      )}
      {source && (
        <span className="text-[#7A9B88] text-[10px] mt-1">Fuente: {source}</span>
      )}
    </div>
  );
}
