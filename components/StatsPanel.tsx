"use client";

interface Totales {
  actasContabilizadas: number;
  contabilizadas: number;
  totalActas: number;
  participacionCiudadana: number;
  actasPendientesJee: number;
  pendientesJee: number;
  fechaActualizacion: number;
  totalVotosEmitidos: number;
  totalVotosValidos: number;
}

interface Props {
  totales: Totales | null;
  label?: string;
}

function formatDate(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleString("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

export default function StatsPanel({ totales, label = "Total País" }: Props) {
  if (!totales) {
    return (
      <div className="animate-pulse space-y-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-12 bg-slate-700 rounded-lg" />
        ))}
      </div>
    );
  }

  const pct = totales.actasContabilizadas;
  const circumference = 2 * Math.PI * 36;
  const strokeDashoffset = circumference - (pct / 100) * circumference;

  return (
    <div className="space-y-3">
      {/* Circular progress - actas contabilizadas */}
      <div className="flex items-center gap-4 bg-slate-800 rounded-xl p-3 border border-slate-700">
        <div className="relative w-20 h-20 shrink-0">
          <svg viewBox="0 0 80 80" className="rotate-[-90deg]">
            <circle
              cx="40"
              cy="40"
              r="36"
              fill="none"
              stroke="#1e293b"
              strokeWidth="8"
            />
            <circle
              cx="40"
              cy="40"
              r="36"
              fill="none"
              stroke="#22c55e"
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-700"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-lg font-bold text-green-400">
              {pct.toFixed(1)}%
            </span>
            <span className="text-xs text-slate-400 leading-tight">actas</span>
          </div>
        </div>
        <div>
          <p className="text-xs text-slate-400 uppercase tracking-wide">
            Actas Contabilizadas
          </p>
          <p className="text-sm font-bold text-white">
            {totales.contabilizadas.toLocaleString("es-PE")}
          </p>
          <p className="text-xs text-slate-500">
            de {totales.totalActas.toLocaleString("es-PE")} actas totales
          </p>
          <div className="mt-1 text-xs text-orange-400">
            Pendientes: {totales.pendientesJee.toLocaleString("es-PE")} (
            {totales.actasPendientesJee.toFixed(1)}%)
          </div>
        </div>
      </div>

      {/* Votos */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
          <p className="text-xs text-slate-400 uppercase tracking-wide">
            Votos Emitidos
          </p>
          <p className="text-base font-bold text-white">
            {totales.totalVotosEmitidos.toLocaleString("es-PE")}
          </p>
        </div>
        <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
          <p className="text-xs text-slate-400 uppercase tracking-wide">
            Votos Válidos
          </p>
          <p className="text-base font-bold text-white">
            {totales.totalVotosValidos.toLocaleString("es-PE")}
          </p>
        </div>
      </div>

      {/* Participación */}
      <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-slate-400 uppercase tracking-wide">
            Participación ciudadana
          </span>
          <span className="text-sm font-bold text-blue-400">
            {totales.participacionCiudadana.toFixed(2)}%
          </span>
        </div>
        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full transition-all duration-700"
            style={{
              width: `${Math.min(totales.participacionCiudadana, 100)}%`,
            }}
          />
        </div>
      </div>

      {/* Fecha actualización */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shrink-0" />
        <span>Actualizado: {formatDate(totales.fechaActualizacion)}</span>
      </div>
    </div>
  );
}
