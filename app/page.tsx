"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import PeruMap from "@/components/PeruMap";
import CandidateList from "@/components/CandidateList";
import StatsPanel from "@/components/StatsPanel";
import ExtranjeroChart from "@/components/ExtranjeroChart";
import ExtranjeroDonut from "@/components/ExtranjeroDonut";
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

interface Department {
  ubigeo: string;
  nombre: string;
}

async function fetchOnpe(path: string, params: Record<string, string>) {
  const qs = new URLSearchParams({ path, ...params }).toString();
  const res = await fetch(`/api/onpe?${qs}`);
  const json = await res.json();
  return json.data;
}

export default function Home() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedUbigeo, setSelectedUbigeo] = useState<string | null>(null);
  const [nationalTotales, setNationalTotales] = useState<Totales | null>(null);
  const [nationalCandidates, setNationalCandidates] = useState<Candidate[]>([]);
  const [deptTotales, setDeptTotales] = useState<Totales | null>(null);
  const [deptCandidates, setDeptCandidates] = useState<Candidate[]>([]);
  const [extranjeroTotales, setExtranjeroTotales] = useState<Totales | null>(
    null
  );
  const [extranjeroCandidates, setExtranjeroCandidates] = useState<Candidate[]>(
    []
  );
  const [departmentColors, setDepartmentColors] = useState<
    Record<string, string>
  >({});
  const [activeTab, setActiveTab] = useState("nacional");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [countdown, setCountdown] = useState(60);

  // Refs para acceder a los valores actuales dentro del intervalo
  // sin provocar dependencias que recreen el timer
  const departmentsRef = useRef<Department[]>([]);
  const selectedUbigeoRef = useRef<string | null>(null);

  useEffect(() => {
    departmentsRef.current = departments;
  }, [departments]);
  useEffect(() => {
    selectedUbigeoRef.current = selectedUbigeo;
  }, [selectedUbigeo]);

  // ── Funciones de carga (estables, sin deps que cambien) ──────────────────
  const loadNational = useCallback(async () => {
    const [totales, candidates] = await Promise.all([
      fetchOnpe("resumen-general/totales", {
        idEleccion: "10",
        tipoFiltro: "eleccion",
      }),
      fetchOnpe("resumen-general/participantes", {
        idEleccion: "10",
        tipoFiltro: "eleccion",
      }),
    ]);
    setNationalTotales(totales);
    setNationalCandidates(candidates || []);
  }, []);

  const loadExtranjero = useCallback(async () => {
    const [totales, candidates] = await Promise.all([
      fetchOnpe("resumen-general/totales", {
        idEleccion: "10",
        tipoFiltro: "ambito_geografico",
        idAmbitoGeografico: "2",
      }),
      fetchOnpe("resumen-general/participantes", {
        idEleccion: "10",
        tipoFiltro: "ambito_geografico",
        idAmbitoGeografico: "2",
      }),
    ]);
    setExtranjeroTotales(totales);
    setExtranjeroCandidates(candidates || []);
  }, []);

  const loadDepartmentColors = useCallback(async (depts: Department[]) => {
    const colors: Record<string, string> = {};
    await Promise.all(
      depts.map(async (dept) => {
        try {
          const candidates: Candidate[] = await fetchOnpe(
            "resumen-general/participantes",
            {
              idEleccion: "10",
              tipoFiltro: "ubigeo_nivel_01",
              idAmbitoGeografico: "1",
              idUbigeoDepartamento: dept.ubigeo,
            }
          );
          if (candidates?.length > 0) {
            const winner = [...candidates].sort(
              (a, b) => b.porcentajeVotosValidos - a.porcentajeVotosValidos
            )[0];
            colors[dept.ubigeo] = getPartyColor(
              winner.codigoAgrupacionPolitica
            );
          }
        } catch {
          /* skip */
        }
      })
    );
    setDepartmentColors(colors);
  }, []);

  const loadDept = useCallback(async (ubigeo: string) => {
    const [totales, candidates] = await Promise.all([
      fetchOnpe("resumen-general/totales", {
        idEleccion: "10",
        tipoFiltro: "ubigeo_nivel_01",
        idAmbitoGeografico: "1",
        idUbigeoDepartamento: ubigeo,
      }),
      fetchOnpe("resumen-general/participantes", {
        idEleccion: "10",
        tipoFiltro: "ubigeo_nivel_01",
        idAmbitoGeografico: "1",
        idUbigeoDepartamento: ubigeo,
      }),
    ]);
    setDeptTotales(totales);
    setDeptCandidates(candidates || []);
  }, []);

  // ── Carga inicial de departamentos ───────────────────────────────────────
  useEffect(() => {
    fetchOnpe("ubigeos/departamentos", {
      idEleccion: "10",
      idAmbitoGeografico: "1",
    }).then((data: Department[]) => setDepartments(data ?? []));
  }, []);

  // ── Carga inicial de todos los datos ────────────────────────────────────
  useEffect(() => {
    loadNational();
    loadExtranjero();
  }, [loadNational, loadExtranjero]);

  // ── Carga inicial de colores del mapa (cuando llegan los departamentos) ──
  useEffect(() => {
    if (departments.length === 0) return;
    loadDepartmentColors(departments);
  }, [departments, loadDepartmentColors]);

  // ── Carga de datos del departamento seleccionado ─────────────────────────
  useEffect(() => {
    if (!selectedUbigeo) {
      setDeptTotales(null);
      setDeptCandidates([]);
      return;
    }
    loadDept(selectedUbigeo);
  }, [selectedUbigeo, loadDept]);

  // ── MASTER TIMER: un solo setInterval de 1 segundo ──────────────────────
  // Usa refs para leer el estado actual sin crear dependencias que recreen el timer.
  // Cada segundo: actualiza countdown.
  // Cada 60 segundos: dispara todos los refresco de datos.
  useEffect(() => {
    let ticks = 0;
    const timer = setInterval(() => {
      ticks += 1;
      const remaining = 60 - (ticks % 60);
      setCountdown(remaining);

      if (ticks % 60 === 0) {
        // Refrescar todo en paralelo
        loadNational();
        loadExtranjero();
        if (departmentsRef.current.length > 0) {
          loadDepartmentColors(departmentsRef.current);
        }
        if (selectedUbigeoRef.current) {
          loadDept(selectedUbigeoRef.current);
        }
        setLastUpdated(new Date());
      }
    }, 1_000);

    // Marcar la hora inicial al montar
    setLastUpdated(new Date());

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intencional: solo se monta una vez

  const handleMapSelect = (ubigeo: string) => {
    if (selectedUbigeo === ubigeo) {
      setSelectedUbigeo(null);
    } else {
      setSelectedUbigeo(ubigeo);
      setActiveTab("departamento");
    }
  };

  const handleSelectChange = (value: string | null) => {
    if (!value || value === "todos") {
      setSelectedUbigeo(null);
      setActiveTab("nacional");
    } else {
      setSelectedUbigeo(value);
      setActiveTab("departamento");
    }
  };

  const selectedDeptName =
    departments.find((d) => d.ubigeo === selectedUbigeo)?.nombre || "";

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <header className="bg-slate-800 border-b border-slate-700 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🇵🇪</span>
            <div>
              <h1 className="text-lg font-bold text-white leading-tight">
                Elecciones en Perú 2026
              </h1>
              <p className="text-xs text-slate-400">
                Elecciones Generales — Resultados en tiempo real
              </p>
            </div>
            <Badge
              variant="outline"
              className="border-green-500 text-green-400 text-xs"
            >
              ONPE Oficial
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            {lastUpdated && (
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shrink-0" />
                <span>{lastUpdated.toLocaleTimeString("es-PE")}</span>
                <span className="text-slate-600">|</span>
                <span className="tabular-nums text-slate-500">
                  próximo en{" "}
                  <span
                    className={
                      countdown <= 10
                        ? "text-yellow-400 font-bold"
                        : "text-slate-400"
                    }
                  >
                    {countdown}s
                  </span>
                </span>
              </div>
            )}
            <Select
              value={selectedUbigeo || "todos"}
              onValueChange={handleSelectChange}
            >
              <SelectTrigger className="w-48 bg-slate-700 border-slate-600 text-white text-xs h-8">
                <span className="truncate flex-1 text-left text-xs">
                  {selectedUbigeo
                    ? departments.find((d) => d.ubigeo === selectedUbigeo)
                        ?.nombre ?? "Departamento"
                    : "Total País"}
                </span>
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600 text-white">
                <SelectItem value="todos" className="text-xs">
                  Total País
                </SelectItem>
                {departments.map((d) => (
                  <SelectItem
                    key={d.ubigeo}
                    value={d.ubigeo}
                    className="text-xs"
                  >
                    {d.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>

      {nationalTotales && (
        <div className="bg-slate-800/50 border-b border-slate-700/50 px-4 py-2">
          <div className="max-w-7xl mx-auto flex items-center gap-6 text-xs flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Actas contabilizadas:</span>
              <span className="font-bold text-green-400">
                {nationalTotales.actasContabilizadas.toFixed(3)}%
              </span>
              <span className="text-slate-500">
                ({nationalTotales.contabilizadas.toLocaleString("es-PE")} de{" "}
                {nationalTotales.totalActas.toLocaleString("es-PE")})
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Pendientes:</span>
              <span className="font-bold text-orange-400">
                {nationalTotales.actasPendientesJee.toFixed(1)}%
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Votos válidos:</span>
              <span className="font-bold text-white">
                {nationalTotales.totalVotosValidos.toLocaleString("es-PE")}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Participación:</span>
              <span className="font-bold text-blue-400">
                {nationalTotales.participacionCiudadana.toFixed(2)}%
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── 3 columnas desktop / 1 columna mobile ── */}
      <main className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex flex-col lg:grid lg:grid-cols-[1fr_320px_280px] gap-4">
          {/* ── COL 1 desktop | ORDEN 2 mobile: MAPA ── */}
          <div className="order-2 lg:order-1 bg-slate-800 rounded-xl border border-slate-700 p-4 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-slate-200">
                {selectedUbigeo ? `MAPA — ${selectedDeptName}` : "MAPA"}
              </h2>
              {selectedUbigeo && (
                <button
                  onClick={() => {
                    setSelectedUbigeo(null);
                    setActiveTab("nacional");
                  }}
                  className="text-xs text-slate-400 hover:text-white transition-colors underline"
                >
                  Ver total país
                </button>
              )}
            </div>

            {/* Mapa + Donut lado a lado */}
            <div className="flex gap-3 items-start">
              {/* Mapa SVG — ocupa el espacio restante */}
              <div className="flex-1 min-w-0">
                <PeruMap
                  departmentColors={departmentColors}
                  departments={departments}
                  selectedUbigeo={selectedUbigeo}
                  onSelect={handleMapSelect}
                />
                <p className="text-xs text-slate-500 text-center mt-1">
                  Clic en un departamento para filtrar
                </p>
              </div>

              {/* Donut extranjero — ancho fijo */}
              <div className="w-[140px] shrink-0 bg-slate-700/30 rounded-xl border border-slate-700 p-2.5">
                <ExtranjeroDonut
                  candidates={extranjeroCandidates}
                  totales={extranjeroTotales}
                />
              </div>
            </div>

            {/* Leyenda de colores */}
            <div className="mt-3 border-t border-slate-700 pt-3 grid grid-cols-2 gap-x-4 gap-y-1">
              <p className="col-span-2 text-xs text-slate-400 uppercase tracking-wide mb-1">
                Candidato líder por depto.
              </p>
              {nationalCandidates
                .slice()
                .sort(
                  (a, b) => b.porcentajeVotosValidos - a.porcentajeVotosValidos
                )
                .slice(0, 8)
                .map((c) => (
                  <div
                    key={c.dniCandidato}
                    className="flex items-center gap-1.5 min-w-0"
                  >
                    <div
                      className="w-2.5 h-2.5 rounded-sm shrink-0"
                      style={{
                        backgroundColor: getPartyColor(
                          c.codigoAgrupacionPolitica
                        ),
                      }}
                    />
                    <span className="text-xs text-slate-300 truncate leading-tight">
                      {c.nombreCandidato.split(" ").slice(-2).join(" ")}
                    </span>
                  </div>
                ))}
            </div>
          </div>

          {/* ── COL 2 desktop | ORDEN 3 mobile: RESULTADOS ── */}
          <div className="order-3 lg:order-2 flex flex-col gap-3">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full bg-slate-800 border border-slate-700 grid grid-cols-3">
                <TabsTrigger
                  value="nacional"
                  className="text-xs data-[state=active]:bg-slate-600"
                >
                  Nacional
                </TabsTrigger>
                <TabsTrigger
                  value="departamento"
                  className="text-xs data-[state=active]:bg-slate-600"
                >
                  {selectedUbigeo ? selectedDeptName.split(" ")[0] : "Depto."}
                </TabsTrigger>
                <TabsTrigger
                  value="extranjero"
                  className="text-xs data-[state=active]:bg-slate-600"
                >
                  Extranjero
                </TabsTrigger>
              </TabsList>

              {/* Tab Nacional — Candidatos */}
              <TabsContent value="nacional" className="mt-0">
                <div className="bg-slate-800 rounded-xl border border-slate-700 p-3">
                  <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wide mb-3">
                    Resultados
                  </h3>
                  <CandidateList candidates={nationalCandidates} topN={10} />
                </div>
              </TabsContent>

              {/* Tab Departamento — Candidatos */}
              <TabsContent value="departamento" className="mt-0">
                {!selectedUbigeo ? (
                  <div className="bg-slate-800 rounded-xl border border-slate-700 p-8 text-center">
                    <p className="text-slate-400 text-sm">
                      Selecciona un departamento en el mapa o el selector
                    </p>
                  </div>
                ) : (
                  <div className="bg-slate-800 rounded-xl border border-slate-700 p-3">
                    <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wide mb-3">
                      Resultados — {selectedDeptName}
                    </h3>
                    <CandidateList candidates={deptCandidates} topN={10} />
                  </div>
                )}
              </TabsContent>

              {/* Tab Extranjero — Candidatos + chart */}
              <TabsContent value="extranjero" className="mt-0 space-y-3">
                <div className="bg-slate-800 rounded-xl border border-slate-700 p-3">
                  <div className="flex items-center gap-2 mb-3">
                    <span>✈️</span>
                    <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wide">
                      Votos en el Extranjero
                    </h3>
                  </div>
                  <ExtranjeroChart
                    candidates={extranjeroCandidates}
                    totales={extranjeroTotales}
                  />
                </div>
                <div className="bg-slate-800 rounded-xl border border-slate-700 p-3">
                  <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wide mb-3">
                    Candidatos — Extranjero
                  </h3>
                  <CandidateList candidates={extranjeroCandidates} topN={8} />
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* ── COL 3 desktop | ORDEN 1 mobile: ESTADÍSTICAS ── */}
          <div className="order-1 lg:order-3 flex flex-col gap-3">
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
              <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wide mb-3">
                {activeTab === "extranjero"
                  ? "Estadísticas"
                  : activeTab === "departamento" && selectedUbigeo
                  ? `Estadísticas — ${selectedDeptName}`
                  : "Estadísticas"}
              </h3>
              <StatsPanel
                totales={
                  activeTab === "extranjero"
                    ? extranjeroTotales
                    : activeTab === "departamento" && selectedUbigeo
                    ? deptTotales
                    : nationalTotales
                }
              />
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-700 mt-8 py-6 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500 text-center sm:text-left">
            Fuente: ONPE — Oficina Nacional de Procesos Electorales
          </p>

          <a
            href="https://www.linkedin.com/in/luisvelark/"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-2.5 bg-slate-800 hover:bg-[#0A66C2] border border-slate-700 hover:border-[#0A66C2] rounded-lg px-4 py-2 transition-all duration-200 shrink-0"
          >
            {/* LinkedIn icon */}
            <svg
              viewBox="0 0 24 24"
              className="w-4 h-4 fill-[#0A66C2] group-hover:fill-white transition-colors shrink-0"
            >
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
            <div className="text-left">
              <p className="text-xs font-semibold text-slate-200 group-hover:text-white leading-tight transition-colors">
                Luis Velasquez
              </p>
              <p className="text-xs text-slate-400 group-hover:text-blue-100 leading-tight transition-colors">
                Conecta en LinkedIn
              </p>
            </div>
            <svg
              viewBox="0 0 24 24"
              className="w-3 h-3 fill-slate-500 group-hover:fill-white group-hover:translate-x-0.5 transition-all shrink-0"
            >
              <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
            </svg>
          </a>
        </div>
      </footer>
    </div>
  );
}
