import { useState } from 'react';
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from 'react-simple-maps';
import { Plus, Minus, RotateCcw, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { FILIALES } from '../../lib/constants';
import { eur } from '../../lib/format';
import { useSimulatedBalances } from '../../hooks/useSimulatedBalances';
import { useTreasury } from '../../context/TreasuryContext';
import { FlowOverlay } from '../demo/FlowOverlay';
import type { TransferFlowState, SweepFlowState } from '../../types/flow';

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

const DEFAULT_CENTER: [number, number] = [-20, 20];
const DEFAULT_ZOOM = 1;
const MIN_ZOOM = 1;
const MAX_ZOOM = 6;

function nodeColor(balance: number, target: number) {
  if (balance > target * 1.1) return '#22C55E';
  if (balance < target * 0.9) return '#EF4444';
  return '#3B82F6';
}

interface MapaFilialesProps {
  onSweepReady?: () => void;
  transferFlow?: TransferFlowState;
  sweepFlow?: SweepFlowState;
}

export function MapaFiliales({ onSweepReady: _onSweepReady, transferFlow, sweepFlow }: MapaFilialesProps) {
  const balances = useSimulatedBalances(true);
  const { dispatch } = useTreasury();
  const [selected, setSelected] = useState<string | null>(null);
  const [position, setPosition] = useState<{ coordinates: [number, number]; zoom: number }>({
    coordinates: DEFAULT_CENTER,
    zoom: DEFAULT_ZOOM,
  });
  const [panelOpen, setPanelOpen] = useState(true);

  const enriched = FILIALES.map((f) => ({
    ...f,
    balance: balances.find((b) => b.id === f.id)?.balance ?? f.balance,
  }));

  const selectedFilial = enriched.find((f) => f.id === selected);
  const excedentes = enriched.filter((f) => f.balance > f.target * 1.1);
  const deficitarios = enriched.filter((f) => f.balance < f.target * 0.9);

  function handleZoomIn() {
    setPosition((p) => ({ ...p, zoom: Math.min(p.zoom * 1.5, MAX_ZOOM) }));
  }

  function handleZoomOut() {
    setPosition((p) => ({ ...p, zoom: Math.max(p.zoom / 1.5, MIN_ZOOM) }));
  }

  function handleReset() {
    setPosition({ coordinates: DEFAULT_CENTER, zoom: DEFAULT_ZOOM });
  }

  function handleSelectFromList(f: (typeof enriched)[number]) {
    if (selected === f.id) {
      setSelected(null);
      return;
    }
    setSelected(f.id);
    setPosition((p) => ({ coordinates: f.coordinates, zoom: Math.max(p.zoom, 3) }));
  }

  const showFlow = !!(transferFlow || sweepFlow);

  return (
    <div className="relative w-full h-full flex flex-col bg-[#0A2116]">
      {/* Leyenda */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-3 bg-[#0A2116]/85 backdrop-blur-sm rounded-lg px-3 py-1.5 border border-[#193D2A]">
        <div className="flex items-center gap-1.5 text-xs text-[#7A9B88]">
          <div className="w-2.5 h-2.5 rounded-full bg-green-400" />Exceso
        </div>
        <div className="flex items-center gap-1.5 text-xs text-[#7A9B88]">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400" />Déficit
        </div>
        <div className="flex items-center gap-1.5 text-xs text-[#7A9B88]">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-400" />Target
        </div>
        <button
          onClick={() => dispatch({ type: 'RESET' })}
          className="flex items-center gap-1 ml-1 text-[#7A9B88] hover:text-[#3D9E63] transition-colors"
          title="Reiniciar saldos"
        >
          <RefreshCw className="w-3 h-3" />
        </button>
      </div>

      {/* Controles zoom */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-1">
        {[
          { icon: <Plus className="w-3.5 h-3.5" />, onClick: handleZoomIn, title: 'Acercar' },
          { icon: <Minus className="w-3.5 h-3.5" />, onClick: handleZoomOut, title: 'Alejar' },
          { icon: <RotateCcw className="w-3.5 h-3.5" />, onClick: handleReset, title: 'Restablecer vista' },
        ].map(({ icon, onClick, title }) => (
          <button
            key={title}
            onClick={onClick}
            title={title}
            className="w-8 h-8 flex items-center justify-center bg-[#0A2116]/85 backdrop-blur-sm border border-[#3D9E63]/40 rounded text-[#7A9B88] hover:text-[#3D9E63] hover:border-[#3D9E63] transition-colors"
          >
            {icon}
          </button>
        ))}
      </div>

      {/* Mapa */}
      <ComposableMap
        projection="geoNaturalEarth1"
        projectionConfig={{ scale: 130, center: [-20, 20] }}
        style={{ width: '100%', height: '100%', cursor: 'grab' }}
      >
        <ZoomableGroup
          center={position.coordinates}
          zoom={position.zoom}
          minZoom={MIN_ZOOM}
          maxZoom={MAX_ZOOM}
          onMoveEnd={(pos: { coordinates: [number, number]; zoom: number }) => setPosition(pos)}
        >
          <Geographies geography={GEO_URL}>
            {({ geographies }: { geographies: object[] }) =>
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              geographies.map((geo: any) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill="#0A2116"
                  stroke="#193D2A"
                  strokeWidth={0.5}
                  style={{ default: { outline: 'none' }, hover: { outline: 'none' }, pressed: { outline: 'none' } }}
                />
              ))
            }
          </Geographies>

          {showFlow && transferFlow && sweepFlow && (
            <FlowOverlay
              transferFlow={transferFlow}
              sweepFlow={sweepFlow}
              zoom={position.zoom}
            />
          )}

          {(() => {
            const z = Math.sqrt(position.zoom);
            return enriched.map((f) => {
              const color = nodeColor(f.balance, f.target);
              const isSelected = selected === f.id;
              return (
                <Marker
                  key={f.id}
                  coordinates={f.coordinates}
                  onClick={() => setSelected(f.id === selected ? null : f.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <circle
                    r={(f.isHQ ? 9 : 6) / z}
                    fill={color}
                    fillOpacity={isSelected ? 1 : 0.85}
                    stroke={isSelected ? '#3D9E63' : '#0A2116'}
                    strokeWidth={(isSelected ? 3 : 1.5) / z}
                  />
                  {/* <text
                    textAnchor="middle"
                    y={-12 / z}
                    style={{ fontSize: `${9 / z}px`, fill: '#fff', fontFamily: 'Inter, sans-serif', pointerEvents: 'none' }}
                  >
                    {f.name}
                  </text> */}
                </Marker>
              );
            });
          })()}
        </ZoomableGroup>
      </ComposableMap>

      {/* Panel flotante inferior izquierdo */}
      <div className="absolute bottom-4 left-4 z-10 w-56">
        {/* Filial seleccionada */}
        {selectedFilial && (
          <div className="bg-[#0A2116]/90 backdrop-blur-sm border border-[#3D9E63]/40 rounded-lg p-3 mb-2">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: nodeColor(selectedFilial.balance, selectedFilial.target) }} />
              <span className="text-white font-semibold text-xs truncate">{selectedFilial.name}</span>
              {selectedFilial.isHQ && <span className="text-[#3D9E63] text-[10px] shrink-0">HQ</span>}
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between"><span className="text-[#7A9B88]">Saldo</span><span className="text-white font-mono">{eur(selectedFilial.balance / 1_000_000, 2)}M€</span></div>
              <div className="flex justify-between"><span className="text-[#7A9B88]">Target</span><span className="text-white font-mono">{eur(selectedFilial.target / 1_000_000, 2)}M€</span></div>
              <div className="flex justify-between">
                <span className="text-[#7A9B88]">Posición</span>
                <span className={`font-semibold ${selectedFilial.balance > selectedFilial.target ? 'text-green-400' : 'text-red-400'}`}>
                  {selectedFilial.balance > selectedFilial.target ? '+' : ''}{eur((selectedFilial.balance - selectedFilial.target) / 1_000_000, 2)}M€
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Resumen + lista colapsable */}
        <div className="bg-[#0A2116]/90 backdrop-blur-sm border border-[#193D2A] rounded-lg overflow-hidden">
          <button
            onClick={() => setPanelOpen((p) => !p)}
            className="w-full flex items-center justify-between px-3 py-2 text-xs text-[#7A9B88] hover:text-white transition-colors"
          >
            <span className="font-medium">
              <span className="text-green-400">{excedentes.length}↑</span>
              {' · '}
              <span className="text-red-400">{deficitarios.length}↓</span>
              {' · '}
              <span className="text-blue-400">{enriched.length - excedentes.length - deficitarios.length}=</span>
            </span>
            {panelOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
          </button>
          {panelOpen && (
            <div className="border-t border-[#193D2A] max-h-44 overflow-y-auto">
              {enriched.map((f) => (
                <button
                  key={f.id}
                  onClick={() => handleSelectFromList(f)}
                  className={`w-full flex items-center justify-between px-3 py-1.5 text-xs transition-colors border-b border-[#193D2A]/50 last:border-0 ${
                    selected === f.id ? 'bg-[#3D9E63]/10 text-white' : 'text-[#7A9B88] hover:text-white hover:bg-[#193D2A]/50'
                  }`}
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: nodeColor(f.balance, f.target) }} />
                    <span className="truncate">{f.name}</span>
                  </div>
                  <span className="font-mono shrink-0 ml-1">{eur(f.balance / 1_000_000, 1)}M</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
