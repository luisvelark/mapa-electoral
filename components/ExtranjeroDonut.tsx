"use client";

import { useMemo } from "react";
import { getPartyColor } from "@/lib/partyColors";

interface Candidate {
  nombreAgrupacionPolitica: string;
  codigoAgrupacionPolitica: number;
  nombreCandidato: string;
  dniCandidato: string;
  totalVotosValidos: number;
  porcentajeVotosValidos: number;
}

interface Totales {
  actasContabilizadas: number;
  contabilizadas: number;
  totalActas: number;
  totalVotosValidos: number;
}

interface Props {
  candidates: Candidate[];
  totales: Totales | null;
}

const SIZE = 200;
const CX = SIZE / 2;
const CY = SIZE / 2;
const R_OUTER = 80;
const R_INNER = 50;

function lastName(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .join(" ")
    .toLowerCase()
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

function arcPath(
  cx: number,
  cy: number,
  rOuter: number,
  rInner: number,
  startDeg: number,
  endDeg: number
) {
  // Clamp arc to avoid degenerate full-circle paths
  const sweep = Math.min(endDeg - startDeg, 359.99);
  const o1 = polarToCartesian(cx, cy, rOuter, startDeg);
  const o2 = polarToCartesian(cx, cy, rOuter, startDeg + sweep);
  const i1 = polarToCartesian(cx, cy, rInner, startDeg + sweep);
  const i2 = polarToCartesian(cx, cy, rInner, startDeg);
  const large = sweep > 180 ? 1 : 0;
  return [
    `M ${o1.x} ${o1.y}`,
    `A ${rOuter} ${rOuter} 0 ${large} 1 ${o2.x} ${o2.y}`,
    `L ${i1.x} ${i1.y}`,
    `A ${rInner} ${rInner} 0 ${large} 0 ${i2.x} ${i2.y}`,
    "Z",
  ].join(" ");
}

export default function ExtranjeroDonut({ candidates, totales }: Props) {
  const top5 = useMemo(
    () =>
      [...candidates]
        .sort((a, b) => b.porcentajeVotosValidos - a.porcentajeVotosValidos)
        .slice(0, 5),
    [candidates]
  );

  const slices = useMemo(() => {
    const total = top5.reduce((s, c) => s + c.porcentajeVotosValidos, 0);
    const others = Math.max(0, 100 - total);

    const base = top5.reduce<{ list: typeof top5; angles: number[] }>(
      (acc, c) => {
        const startDeg = acc.angles[acc.angles.length - 1] ?? 0;
        const endDeg = startDeg + (c.porcentajeVotosValidos / 100) * 360;
        return { list: [...acc.list, c], angles: [...acc.angles, endDeg] };
      },
      { list: [], angles: [0] }
    );

    const result: {
      candidate: (typeof top5)[number] & { codigoAgrupacionPolitica: number };
      startDeg: number;
      endDeg: number;
    }[] = top5.map((c, i) => ({
      candidate: c,
      startDeg: base.angles[i] ?? 0,
      endDeg: base.angles[i + 1] ?? 0,
    }));

    if (others > 0.5) {
      const lastEnd = base.angles[base.angles.length - 1] ?? 0;
      result.push({
        candidate: {
          codigoAgrupacionPolitica: -1,
          porcentajeVotosValidos: others,
          nombreCandidato: "Otros",
          dniCandidato: "",
          nombreAgrupacionPolitica: "",
          totalVotosValidos: 0,
        },
        startDeg: lastEnd,
        endDeg: lastEnd + (others / 100) * 360,
      });
    }

    return result;
  }, [top5]);

  const leader = top5[0];
  const leaderColor = leader
    ? getPartyColor(leader.codigoAgrupacionPolitica)
    : "#64748b";

  if (candidates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[200px] gap-2">
        <div className="w-10 h-10 rounded-full bg-slate-700/60 flex items-center justify-center">
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-slate-500">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
          </svg>
        </div>
        <p className="text-xs text-slate-500">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      {/* Título */}
      <div className="flex items-center gap-1.5 mb-1 self-start w-full">
        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-blue-400 shrink-0">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
        </svg>
        <span className="text-xs font-semibold text-slate-300 leading-tight">
          Extranjero
        </span>
      </div>

      {/* Donut SVG */}
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="w-full"
        style={{ maxWidth: 200 }}
      >
        <defs>
          <filter id="donut-glow">
            <feDropShadow
              dx="0"
              dy="0"
              stdDeviation="3"
              floodColor={leaderColor}
              floodOpacity="0.5"
            />
          </filter>
        </defs>

        {/* Fondo del donut */}
        <circle cx={CX} cy={CY} r={R_OUTER} fill="#1e293b" />
        <circle cx={CX} cy={CY} r={R_INNER} fill="#0f172a" />

        {/* Sectores */}
        {slices.map((s, i) => {
          const color =
            s.candidate.codigoAgrupacionPolitica === -1
              ? "#334155"
              : getPartyColor(s.candidate.codigoAgrupacionPolitica);
          return (
            <path
              key={i}
              d={arcPath(CX, CY, R_OUTER, R_INNER, s.startDeg, s.endDeg)}
              fill={color}
              fillOpacity={i === 0 ? 1 : 0.75}
              stroke="#0f172a"
              strokeWidth="1"
              filter={i === 0 ? "url(#donut-glow)" : undefined}
            />
          );
        })}

        {/* Foto del líder en el centro */}
        {leader && (
          <>
            <defs>
              <clipPath id="leader-clip">
                <circle cx={CX} cy={CY} r={R_INNER - 6} />
              </clipPath>
            </defs>
            <image
              href={`https://resultadoelectoral.onpe.gob.pe/assets/img-reales/candidatos/${leader.dniCandidato}.jpg`}
              x={CX - (R_INNER - 6)}
              y={CY - (R_INNER - 6)}
              width={(R_INNER - 6) * 2}
              height={(R_INNER - 6) * 2}
              clipPath="url(#leader-clip)"
              preserveAspectRatio="xMidYMid slice"
            />
            {/* Ring interior alrededor de la foto */}
            <circle
              cx={CX}
              cy={CY}
              r={R_INNER - 6}
              fill="none"
              stroke={leaderColor}
              strokeWidth="1.5"
              strokeOpacity={0.8}
            />
          </>
        )}

        {/* Porcentaje del líder centrado */}
        {/* {leader && (
          <text
            x={CX}
            y={CY + 2}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="11"
            fontWeight="800"
            fill={leaderColor}
            className="pointer-events-none"
            paintOrder="stroke"
            stroke="#0f172a"
            strokeWidth="3"
            strokeLinejoin="round"
          >
            {leader.porcentajeVotosValidos.toFixed(1)}%
          </text>
        )} */}
      </svg>

      {/* Nombre del líder */}
      {leader && (
        <p
          className="text-xs font-bold text-white text-center leading-tight mt-1"
          style={{ color: leaderColor }}
        >
          {lastName(leader.nombreCandidato)}
        </p>
      )}

      {/* Totales */}
      {totales && (
        <p className="text-xs text-slate-500 text-center leading-tight mt-0.5">
          {totales.actasContabilizadas.toFixed(1)}% actas
        </p>
      )}

      {/* Leyenda top 4 */}
      <div className="w-full mt-2 space-y-1">
        {top5.slice(0, 4).map((c, i) => {
          const color = getPartyColor(c.codigoAgrupacionPolitica);
          return (
            <div key={c.dniCandidato} className="flex items-center gap-1.5">
              <div
                className="w-2 h-2 rounded-sm shrink-0"
                style={{ backgroundColor: color }}
              />
              <span className="text-xs text-slate-400 truncate flex-1 leading-tight">
                {lastName(c.nombreCandidato)}
              </span>
              <span
                className="text-xs font-bold tabular-nums shrink-0"
                style={{ color }}
              >
                {c.porcentajeVotosValidos.toFixed(1)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
