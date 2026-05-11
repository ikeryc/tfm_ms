type BadgeVariant = 'success' | 'danger' | 'warning' | 'info' | 'gold';

const variants: Record<BadgeVariant, string> = {
  success: 'bg-green-900/40 text-green-400 border-green-700/40',
  danger: 'bg-red-900/40 text-red-400 border-red-700/40',
  warning: 'bg-yellow-900/40 text-yellow-400 border-yellow-700/40',
  info: 'bg-blue-900/40 text-blue-300 border-blue-700/40',
  gold: 'bg-[#3D9E63]/20 text-[#3D9E63] border-[#3D9E63]/40',
};

export function Badge({ children, variant = 'info' }: { children: React.ReactNode; variant?: BadgeVariant }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${variants[variant]}`}>
      {children}
    </span>
  );
}
