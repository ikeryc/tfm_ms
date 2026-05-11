export function SectionTitle({ title, subtitle, source }: { title: string; subtitle?: string; source?: string }) {
  return (
    <div className="mb-6">
      <h2 className="text-xl font-bold text-white">{title}</h2>
      {subtitle && <p className="text-[#7A9B88] text-sm mt-1">{subtitle}</p>}
      {source && <p className="text-[#7A9B88] text-[10px] mt-1">Fuente: {source}</p>}
    </div>
  );
}
