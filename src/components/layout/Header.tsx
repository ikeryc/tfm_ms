import { Link, useLocation } from 'react-router-dom';

const links = [
  { to: '/', label: 'Inicio' },
  { to: '/analisis', label: 'Análisis de Viabilidad' },
  { to: '/demo', label: 'Demostración Interactiva' },
];

export function Header() {
  const { pathname } = useLocation();

  const isActive = (to: string) =>
    to === '/' ? pathname === '/' : pathname.startsWith(to);

  return (
    <header className="bg-[#0A2116] border-b border-[#193D2A] sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-14">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-[#3D9E63] to-[#193D2A] rounded-lg flex items-center justify-center shadow-[0_0_8px_rgba(61,158,99,0.25)]">
            <span className="text-white font-bold text-xs tracking-wide">VID</span>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="text-white font-semibold text-sm">Vidrala S.A.</span>
            <div className="w-px h-3.5 bg-[#193D2A]" />
            <span className="text-[#7A9B88] text-xs hidden sm:inline">Tesorería Corporativa · Demo</span>
          </div>
        </div>
        <nav className="flex items-center gap-1">
          {links.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`relative px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                isActive(to)
                  ? 'bg-[#193D2A] text-white'
                  : 'text-[#7A9B88] hover:text-white hover:bg-[#193D2A]/50'
              }`}
            >
              {label}
              {isActive(to) && (
                <span className="absolute bottom-0 left-3 right-3 h-px bg-[#3D9E63]" />
              )}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
