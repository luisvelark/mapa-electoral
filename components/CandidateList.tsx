"use client";

import { getPartyColor } from "@/lib/partyColors";

interface Candidate {
  nombreAgrupacionPolitica: string;
  codigoAgrupacionPolitica: number;
  nombreCandidato: string;
  dniCandidato: string;
  totalVotosValidos: number;
  porcentajeVotosValidos: number;
  porcentajeVotosEmitidos: number;
}

interface Props {
  candidates: Candidate[];
  topN?: number;
}

const MEDAL = ["🥇", "🥈", "🥉"];

function formatName(name: string): string {
  return name
    .toLowerCase()
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function shortLastNames(name: string): string {
  const parts = name.split(" ");
  // Tomar apellidos (primeras 2 palabras del nombre completo en mayúsculas son apellidos)
  return parts.slice(0, 2).join(" ")
    .toLowerCase()
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export default function CandidateList({ candidates, topN = 10 }: Props) {
  const sorted = [...candidates].sort(
    (a, b) => b.porcentajeVotosValidos - a.porcentajeVotosValidos
  );
  const displayed = sorted.slice(0, topN);
  const maxPct = displayed[0]?.porcentajeVotosValidos || 1;

  return (
    <div className="space-y-1.5">
      {displayed.map((c, i) => {
        const color = getPartyColor(c.codigoAgrupacionPolitica);
        const isLeader = i === 0;
        const hasMedal = i < 3;

        return (
          <div
            key={c.dniCandidato}
            className={`rounded-lg p-2 transition-all ${
              isLeader
                ? "bg-slate-700/60 ring-1 ring-inset ring-slate-500"
                : "bg-slate-800/50 hover:bg-slate-700/30"
            }`}
          >
            <div className="flex items-center gap-2">
              {/* Rank / Medal */}
              <div className="w-6 shrink-0 text-center">
                {hasMedal ? (
                  <span className="text-sm leading-none">{MEDAL[i]}</span>
                ) : (
                  <span className="text-xs text-slate-500 font-mono">{i + 1}</span>
                )}
              </div>

              {/* Foto */}
              <div
                className="w-9 h-9 rounded-full overflow-hidden shrink-0 border-2"
                style={{ borderColor: isLeader ? color : "#475569" }}
              >
                <img
                  src={`https://resultadoelectoral.onpe.gob.pe/assets/img-reales/candidatos/${c.dniCandidato}.jpg`}
                  alt={c.nombreCandidato}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      shortLastNames(c.nombreCandidato)
                    )}&size=36&background=1e293b&color=94a3b8&bold=true&length=2`;
                  }}
                />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                {/* Nombre + porcentaje */}
                <div className="flex items-baseline justify-between gap-1 mb-0.5">
                  <span className={`text-xs font-semibold truncate leading-tight ${isLeader ? "text-white" : "text-slate-200"}`}>
                    {formatName(c.nombreCandidato)}
                  </span>
                  <span
                    className={`shrink-0 tabular-nums font-bold leading-none ${isLeader ? "text-base" : "text-sm"}`}
                    style={{ color }}
                  >
                    {c.porcentajeVotosValidos.toFixed(2)}%
                  </span>
                </div>

                {/* Partido */}
                <div className="flex items-center gap-1 mb-1.5">
                  <img
                    src={`https://resultadoelectoral.onpe.gob.pe/assets/img-reales/partidos/${String(
                      c.codigoAgrupacionPolitica
                    ).padStart(8, "0")}.jpg`}
                    alt=""
                    className="w-3.5 h-3.5 object-contain rounded-sm bg-slate-700 shrink-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                  <span className="text-xs text-slate-400 truncate leading-tight">
                    {c.nombreAgrupacionPolitica}
                  </span>
                </div>

                {/* Barra de votos */}
                <div className="relative h-2 rounded-full bg-slate-700/80 overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 rounded-full transition-all duration-700"
                    style={{
                      width: `${(c.porcentajeVotosValidos / maxPct) * 100}%`,
                      backgroundColor: color,
                      opacity: isLeader ? 1 : 0.75,
                    }}
                  />
                </div>

                {/* Votos totales */}
                <div className="flex items-center justify-between mt-0.5">
                  <span className="text-xs text-slate-500 tabular-nums">
                    {c.totalVotosValidos.toLocaleString("es-PE")} votos
                  </span>
                  {isLeader && (
                    <span
                      className="text-xs font-bold px-1.5 py-0 rounded-full leading-tight"
                      style={{ backgroundColor: `${color}22`, color }}
                    >
                      LIDERA
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
