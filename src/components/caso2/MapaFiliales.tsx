import { useState, useMemo } from 'react';
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

type EnrichedFilial = (typeof FILIALES)[number] & { balance: number };

type MarkerGroup = {
  id: string;
  coordinates: [number, number];
  members: EnrichedFilial[];
  isCluster: boolean;
  isHQ: boolean;
};

function clusterMarkers(markers: EnrichedFilial[], threshold = 0.5): MarkerGroup[] {
  const visited = new Set<number>();
  const groups: MarkerGroup[] = [];
  for (let i = 0; i < markers.length; i++) {
    if (visited.has(i)) continue;
    const members = [markers[i]];
    visited.add(i);
    for (let j = i + 1; j < markers.length; j++) {
      if (visited.has(j)) continue;
      const dx = markers[i].coordinates[0] - markers[j].coordinates[0];
      const dy = markers[i].coordinates[1] - markers[j].coordinates[1];
      if (Math.sqrt(dx * dx + dy * dy) < threshold) { members.push(markers[j]); visited.add(j); }
    }
    const cx = members.reduce((s, m) => s + m.coordinates[0], 0) / members.length;
    const cy = members.reduce((s, m) => s + m.coordinates[1], 0) / members.length;
    groups.push({
      id: members.length > 1 ? `cluster-${markers[i].id}` : members[0].id,
      coordinates: [cx, cy],
      members,
      isCluster: members.length > 1,
      isHQ: members.some((m) => m.isHQ),
    });
  }
  return groups;
}

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

  const clusters = useMemo(() => clusterMarkers(enriched), [enriched]);
  const selectedGroup = clusters.find((g) => g.id === selected);

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

  function handleSelectFromList(f: EnrichedFilial) {
    const group = clusters.find((g) => g.members.some((m) => m.id === f.id));
    if (!group) return;
    if (selected === group.id) { setSelected(null); return; }
    setSelected(group.id);
    setPosition((p) => ({ coordinates: group.coordinates, zoom: Math.max(p.zoom, 3) }));
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
            return clusters.map((group) => {
              const isSelected = selected === group.id;
              const clusterBalance = group.members.reduce((s, m) => s + m.balance, 0);
              const clusterTarget  = group.members.reduce((s, m) => s + m.target,  0);
              const color = nodeColor(clusterBalance, clusterTarget);
              const baseR = group.isCluster ? 9 : (group.isHQ ? 7 : 6);
              return (
                <Marker
                  key={group.id}
                  coordinates={group.coordinates}
                  onClick={() => setSelected(group.id === selected ? null : group.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <circle
                    r={baseR / z}
                    fill={color}
                    fillOpacity={isSelected ? 1 : 0.85}
                    stroke={isSelected ? '#3D9E63' : '#0A2116'}
                    strokeWidth={(isSelected ? 3 : 1.5) / z}
                  />
                  {group.isCluster && (
                    <text
                      textAnchor="middle"
                      dominantBaseline="central"
                      style={{ fontSize: `${6 / z}px`, fill: '#fff', fontFamily: 'Inter, sans-serif', pointerEvents: 'none', fontWeight: 'bold' }}
                    >
                      {group.members.length}
                    </text>
                  )}
                </Marker>
              );
            });
          })()}
        </ZoomableGroup>
      </ComposableMap>

      {/* Panel flotante inferior izquierdo */}
      <div className="absolute bottom-4 left-4 z-10 w-56">
        {/* Filial / cluster seleccionado */}
        {selectedGroup && (
          <div className="bg-[#0A2116]/90 backdrop-blur-sm border border-[#3D9E63]/40 rounded-lg p-3 mb-2">
            {selectedGroup.isCluster ? (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-white font-semibold text-xs truncate">{selectedGroup.members[0].city}</span>
                  <span className="text-[#3D9E63] text-[10px] shrink-0">{selectedGroup.members.length} filiales</span>
                </div>
                <div className="space-y-2">
                  {selectedGroup.members.map((m) => (
                    <div key={m.id} className="space-y-0.5 text-xs">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: nodeColor(m.balance, m.target) }} />
                        <span className="text-white font-medium truncate">{m.name}</span>
                        {m.isHQ && <span className="text-[#3D9E63] text-[10px] shrink-0">HQ</span>}
                      </div>
                      <div className="flex justify-between pl-3.5">
                        <span className="text-[#7A9B88]">Saldo</span>
                        <span className="text-white font-mono">{eur(m.balance / 1_000_000, 2)}M€</span>
                      </div>
                      <div className="flex justify-between pl-3.5">
                        <span className="text-[#7A9B88]">Posición</span>
                        <span className={`font-semibold ${m.balance > m.target ? 'text-green-400' : 'text-red-400'}`}>
                          {m.balance > m.target ? '+' : ''}{eur((m.balance - m.target) / 1_000_000, 2)}M€
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: nodeColor(selectedGroup.members[0].balance, selectedGroup.members[0].target) }} />
                  <span className="text-white font-semibold text-xs truncate">{selectedGroup.members[0].name}</span>
                  {selectedGroup.isHQ && <span className="text-[#3D9E63] text-[10px] shrink-0">HQ</span>}
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#7A9B88]">Saldo</span>
                    <span className="text-white font-mono">{eur(selectedGroup.members[0].balance / 1_000_000, 2)}M€</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#7A9B88]">Target</span>
                    <span className="text-white font-mono">{eur(selectedGroup.members[0].target / 1_000_000, 2)}M€</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#7A9B88]">Posición</span>
                    <span className={`font-semibold ${selectedGroup.members[0].balance > selectedGroup.members[0].target ? 'text-green-400' : 'text-red-400'}`}>
                      {selectedGroup.members[0].balance > selectedGroup.members[0].target ? '+' : ''}
                      {eur((selectedGroup.members[0].balance - selectedGroup.members[0].target) / 1_000_000, 2)}M€
                    </span>
                  </div>
                </div>
              </>
            )}
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
              {enriched.map((f) => {
                const group = clusters.find((g) => g.members.some((m) => m.id === f.id));
                const isActive = group ? selected === group.id : false;
                return (
                  <button
                    key={f.id}
                    onClick={() => handleSelectFromList(f)}
                    className={`w-full flex items-center justify-between px-3 py-1.5 text-xs transition-colors border-b border-[#193D2A]/50 last:border-0 ${
                      isActive ? 'bg-[#3D9E63]/10 text-white' : 'text-[#7A9B88] hover:text-white hover:bg-[#193D2A]/50'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: nodeColor(f.balance, f.target) }} />
                      <span className="truncate">{f.name}</span>
                    </div>
                    <span className="font-mono shrink-0 ml-1">{eur(f.balance / 1_000_000, 1)}M</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
