import { useMapContext } from 'react-simple-maps';
import { motion, AnimatePresence } from 'framer-motion';
import { FILIALES } from '../../lib/constants';
import type { TransferFlowState, SweepFlowState } from '../../types/flow';

interface FlowOverlayProps {
  transferFlow: TransferFlowState;
  sweepFlow: SweepFlowState;
  zoom: number;
}

interface Arc {
  key: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
}

const FILIAL_MAP = Object.fromEntries(FILIALES.map((f) => [f.id, f]));

export function FlowOverlay({ transferFlow, sweepFlow, zoom }: FlowOverlayProps) {
  const { projection } = useMapContext();

  const r = 3.5 / Math.sqrt(zoom);
  const strokeW = Math.max(0.4, 1.2 / Math.sqrt(zoom));

  function getXY(id: string): [number, number] | null {
    const f = FILIAL_MAP[id];
    if (!f) return null;
    const result = projection(f.coordinates);
    if (!result) return null;
    return result as [number, number];
  }

  const arcs: Arc[] = [];

  if (transferFlow.active && transferFlow.fromId && transferFlow.toId) {
    const p1 = getXY(transferFlow.fromId);
    const p2 = getXY(transferFlow.toId);
    if (p1 && p2) {
      arcs.push({ key: 'transfer', x1: p1[0], y1: p1[1], x2: p2[0], y2: p2[1], color: '#3D9E63' });
    }
  }

  if (sweepFlow.active && sweepFlow.phase === 'sweeping') {
    const hqXY = getXY(sweepFlow.hqId);
    if (hqXY) {
      for (const id of sweepFlow.excedentIds) {
        const p = getXY(id);
        if (p && id !== sweepFlow.hqId) {
          arcs.push({ key: `sweep-${id}`, x1: p[0], y1: p[1], x2: hqXY[0], y2: hqXY[1], color: '#22C55E' });
        }
      }
    }
  }

  if (sweepFlow.active && sweepFlow.phase === 'netting') {
    const hqXY = getXY(sweepFlow.hqId);
    if (hqXY) {
      for (const id of sweepFlow.deficitIds) {
        const p = getXY(id);
        if (p && id !== sweepFlow.hqId) {
          arcs.push({ key: `net-${id}`, x1: hqXY[0], y1: hqXY[1], x2: p[0], y2: p[1], color: '#3B82F6' });
        }
      }
    }
  }

  return (
    <AnimatePresence>
      {arcs.map((arc) => (
        <motion.g
          key={arc.key}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
        >
          {/* Línea guía tenue */}
          <line
            x1={arc.x1} y1={arc.y1}
            x2={arc.x2} y2={arc.y2}
            stroke={arc.color}
            strokeWidth={strokeW}
            strokeOpacity={0.25}
            strokeDasharray={`${2 / Math.sqrt(zoom)} ${3 / Math.sqrt(zoom)}`}
          />
          {/* Dots viajeros */}
          {([0, 0.55, 1.1] as const).map((delay, i) => (
            <motion.circle
              key={i}
              r={r}
              fill={arc.color}
              fillOpacity={0.9}
              initial={{ cx: arc.x1, cy: arc.y1 }}
              animate={{
                cx: [arc.x1, arc.x2, arc.x2],
                cy: [arc.y1, arc.y2, arc.y2],
                opacity: [0, 0.9, 0],
              }}
              transition={{
                duration: 1.65,
                repeat: Infinity,
                delay,
                ease: [0.4, 0, 0.6, 1],
                times: [0, 0.75, 1],
              }}
            />
          ))}
        </motion.g>
      ))}
    </AnimatePresence>
  );
}
