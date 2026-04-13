"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
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
  totalVotosEmitidos: number;
  totalVotosValidos: number;
  fechaActualizacion: number;
}

interface Props {
  candidates: Candidate[];
  totales: Totales | null;
}

function shortName(name: string): string {
  const parts = name.split(" ");
  if (parts.length >= 2) {
    return `${parts[parts.length - 2]} ${parts[parts.length - 1]}`.toLowerCase()
      .split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  }
  return name;
}

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{payload: Candidate}> }) => {
  if (active && payload && payload.length) {
    const d = payload[0].payload;
    return (
      <div className="bg-slate-800 border border-slate-600 rounded-lg p-2 text-xs shadow-xl max-w-[180px]">
        <p className="font-bold text-white text-xs leading-tight">{d.nombreCandidato.split(" ").slice(-2).join(" ")}</p>
        <p className="text-slate-300 text-xs truncate">{d.nombreAgrupacionPolitica}</p>
        <p className="text-green-400 font-bold mt-1">{d.porcentajeVotosValidos.toFixed(2)}%</p>
        <p className="text-slate-400">{d.totalVotosValidos.toLocaleString("es-PE")} votos</p>
      </div>
    );
  }
  return null;
};

export default function ExtranjeroChart({ candidates, totales }: Props) {
  if (!candidates.length) return null;

  const sorted = [...candidates]
    .sort((a, b) => b.porcentajeVotosValidos - a.porcentajeVotosValidos)
    .slice(0, 10);

  const chartData = sorted.map((c) => ({
    ...c,
    label: shortName(c.nombreCandidato),
  }));

  return (
    <div className="space-y-3">
      {/* Stats summary */}
      {totales && (
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-slate-800 rounded-lg p-2 border border-slate-700 text-center">
            <p className="text-xs text-slate-400">Actas</p>
            <p className="text-sm font-bold text-green-400">{totales.actasContabilizadas.toFixed(1)}%</p>
            <p className="text-xs text-slate-500">{totales.contabilizadas}/{totales.totalActas}</p>
          </div>
          <div className="bg-slate-800 rounded-lg p-2 border border-slate-700 text-center">
            <p className="text-xs text-slate-400">Emitidos</p>
            <p className="text-sm font-bold text-white">{totales.totalVotosEmitidos.toLocaleString("es-PE")}</p>
          </div>
          <div className="bg-slate-800 rounded-lg p-2 border border-slate-700 text-center">
            <p className="text-xs text-slate-400">Válidos</p>
            <p className="text-sm font-bold text-white">{totales.totalVotosValidos.toLocaleString("es-PE")}</p>
          </div>
        </div>
      )}

      {/* Bar chart */}
      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 30, bottom: 0, left: 0 }}>
            <XAxis type="number" tick={{ fill: "#94a3b8", fontSize: 10 }} tickFormatter={(v) => `${v}%`} />
            <YAxis
              type="category"
              dataKey="label"
              tick={{ fill: "#cbd5e1", fontSize: 10 }}
              width={90}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="porcentajeVotosValidos" radius={[0, 4, 4, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={index} fill={getPartyColor(entry.codigoAgrupacionPolitica)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Top 3 list */}
      <div className="space-y-2 pt-1 border-t border-slate-700">
        <p className="text-xs text-slate-400 uppercase tracking-wide">Top candidatos en extranjero</p>
        {sorted.slice(0, 5).map((c) => {
          const color = getPartyColor(c.codigoAgrupacionPolitica);
          return (
            <div key={c.dniCandidato} className="flex items-center gap-2">
              <div className="w-2 h-8 rounded-sm shrink-0" style={{ backgroundColor: color }} />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-slate-200 truncate">
                    {c.nombreCandidato.split(" ").slice(-2).join(" ")}
                  </span>
                  <span className="text-xs font-bold ml-2 shrink-0" style={{ color }}>
                    {c.porcentajeVotosValidos.toFixed(2)}%
                  </span>
                </div>
                <div className="h-1 bg-slate-700 rounded-full mt-1 overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${(c.porcentajeVotosValidos / sorted[0].porcentajeVotosValidos) * 100}%`,
                      backgroundColor: color,
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
