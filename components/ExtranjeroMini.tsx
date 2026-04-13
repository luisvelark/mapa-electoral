"use client";

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
  totalVotosEmitidos: number;
}

interface Props {
  candidates: Candidate[];
  totales: Totales | null;
}

function lastName(name: string) {
  return name.split(" ").slice(0, 2).join(" ")
    .toLowerCase()
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export default function ExtranjeroMini({ candidates, totales }: Props) {
  const top5 = [...candidates]
    .sort((a, b) => b.porcentajeVotosValidos - a.porcentajeVotosValidos)
    .slice(0, 5);

  const maxPct = top5[0]?.porcentajeVotosValidos || 1;

  return (
    <div className="bg-slate-800/60 rounded-xl border border-slate-700 p-3 mt-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-blue-900/50 border border-blue-700/50 flex items-center justify-center shrink-0">
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-blue-400" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
            </svg>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-200 leading-tight">Votos en el Extranjero</p>
            {totales && (
              <p className="text-xs text-slate-500 leading-tight">
                {totales.actasContabilizadas.toFixed(1)}% actas · {totales.totalVotosValidos.toLocaleString("es-PE")} votos
              </p>
            )}
          </div>
        </div>
        {totales && (
          <div className="text-right shrink-0">
            <p className="text-xs text-slate-500">{totales.contabilizadas}/{totales.totalActas}</p>
            <p className="text-xs text-slate-600">actas</p>
          </div>
        )}
      </div>

      {/* Candidato líder destacado */}
      {top5[0] && (
        <div
          className="flex items-center gap-2 rounded-lg p-2 mb-2"
          style={{ backgroundColor: `${getPartyColor(top5[0].codigoAgrupacionPolitica)}18` }}
        >
          <img
            src={`https://resultadoelectoral.onpe.gob.pe/assets/img-reales/candidatos/${top5[0].dniCandidato}.jpg`}
            alt=""
            className="w-8 h-8 rounded-full object-cover border-2 shrink-0"
            style={{ borderColor: getPartyColor(top5[0].codigoAgrupacionPolitica) }}
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white truncate leading-tight">
              {lastName(top5[0].nombreCandidato)}
            </p>
            <p className="text-xs text-slate-400 truncate leading-tight">{top5[0].nombreAgrupacionPolitica}</p>
          </div>
          <span
            className="text-base font-bold tabular-nums shrink-0"
            style={{ color: getPartyColor(top5[0].codigoAgrupacionPolitica) }}
          >
            {top5[0].porcentajeVotosValidos.toFixed(1)}%
          </span>
        </div>
      )}

      {/* Resto del top 5 */}
      <div className="space-y-1.5">
        {top5.slice(1).map((c) => {
          const color = getPartyColor(c.codigoAgrupacionPolitica);
          return (
            <div key={c.dniCandidato} className="flex items-center gap-2">
              <img
                src={`https://resultadoelectoral.onpe.gob.pe/assets/img-reales/candidatos/${c.dniCandidato}.jpg`}
                alt=""
                className="w-5 h-5 rounded-full object-cover shrink-0 border border-slate-600"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1 mb-0.5">
                  <span className="text-xs text-slate-300 truncate leading-tight">
                    {lastName(c.nombreCandidato)}
                  </span>
                  <span className="text-xs font-bold tabular-nums shrink-0" style={{ color }}>
                    {c.porcentajeVotosValidos.toFixed(1)}%
                  </span>
                </div>
                <div className="h-1 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${(c.porcentajeVotosValidos / maxPct) * 100}%`,
                      backgroundColor: color,
                      opacity: 0.8,
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
