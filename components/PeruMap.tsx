"use client";

import { useMemo, useState } from "react";
import { geoMercator, geoPath } from "d3-geo";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import peruGeoJSON from "@/public/peru-departments.json";

interface DeptProperties {
  ubigeo: string;
  nombre: string;
}

interface Props {
  departmentColors: Record<string, string>;
  departments: { ubigeo: string; nombre: string }[];
  selectedUbigeo: string | null;
  onSelect: (ubigeo: string) => void;
}

const WIDTH = 500;
const HEIGHT = 620;

// Abreviaturas para etiquetas en el mapa
const LABEL_ABBR: Record<string, string> = {
  "010000": "AMAZ", "020000": "ÁNC", "030000": "APU", "040000": "ARE",
  "050000": "AYA", "060000": "CAJ", "070000": "CUS", "080000": "HVC",
  "090000": "HUÁ", "100000": "ICA", "110000": "JUN", "120000": "LL",
  "130000": "LAM", "140000": "LIM", "150000": "LOR", "160000": "MDD",
  "170000": "MOQ", "180000": "PAS", "190000": "PIU", "200000": "PUN",
  "210000": "S.M", "220000": "TAC", "230000": "TUM", "240000": "CAL",
  "250000": "UCA",
};

// Departamentos grandes: mostrar nombre completo (2 líneas)
const LABEL_FULL: Record<string, string[]> = {
  "010000": ["AMAZONAS"],
  "040000": ["AREQUIPA"],
  "050000": ["AYACUCHO"],
  "060000": ["CAJAMARCA"],
  "070000": ["CUSCO"],
  "090000": ["HUÁNUCO"],
  "110000": ["JUNÍN"],
  "120000": ["LA LIBERTAD"],
  "140000": ["LIMA"],
  "150000": ["LORETO"],
  "160000": ["MADRE", "DE DIOS"],
  "190000": ["PIURA"],
  "200000": ["PUNO"],
  "210000": ["SAN MARTÍN"],
  "250000": ["UCAYALI"],
};

export default function PeruMap({
  departmentColors,
  selectedUbigeo,
  onSelect,
}: Props) {
  const [tooltip, setTooltip] = useState<{
    ubigeo: string;
    nombre: string;
    x: number;
    y: number;
  } | null>(null);

  const { pathGenerator, features } = useMemo(() => {
    const geo = peruGeoJSON as FeatureCollection<Geometry, DeptProperties>;

    const projection = geoMercator().fitSize(
      [WIDTH, HEIGHT],
      geo
    );
    const pg = geoPath().projection(projection);

    const feats = geo.features.map((f: Feature<Geometry, DeptProperties>) => {
      const d = pg(f) || "";
      // Calcular centroide para la etiqueta
      const centroid = pg.centroid(f);
      return {
        ubigeo: f.properties.ubigeo,
        nombre: f.properties.nombre,
        d,
        cx: centroid[0] || 0,
        cy: centroid[1] || 0,
      };
    });

    return { pathGenerator: pg, features: feats };
  }, []);

  return (
    <div className="relative w-full select-none">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full h-auto"
        style={{ maxHeight: "580px" }}
      >
        {/* Fondo con gradiente oceánico */}
        <defs>
          <linearGradient id="ocean-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#1e3a5f" />
          </linearGradient>
          <filter id="dept-shadow">
            <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodOpacity="0.4" />
          </filter>
          <filter id="selected-glow">
            <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#fff" floodOpacity="0.7" />
          </filter>
        </defs>

        <rect width={WIDTH} height={HEIGHT} fill="url(#ocean-grad)" rx="6" />

        {/* Label Océano Pacífico */}
        <text
          x={28}
          y={HEIGHT / 2}
          fontSize="8"
          fill="#38bdf8"
          fillOpacity={0.5}
          textAnchor="middle"
          transform={`rotate(-90, 28, ${HEIGHT / 2})`}
          className="pointer-events-none"
          letterSpacing="2"
        >
          OCÉANO PACÍFICO
        </text>

        {/* Departamentos */}
        {features.map(({ ubigeo, nombre, d, cx, cy }) => {
          const color = departmentColors[ubigeo] || "#334155";
          const isSelected = selectedUbigeo === ubigeo;
          const lines = LABEL_FULL[ubigeo];
          const abbr = LABEL_ABBR[ubigeo] || nombre.slice(0, 3);

          return (
            <g
              key={ubigeo}
              onClick={() => onSelect(ubigeo)}
              onMouseEnter={(e) => {
                const rect = (e.currentTarget.ownerSVGElement as SVGSVGElement)
                  .getBoundingClientRect();
                const svgX = ((e.clientX - rect.left) / rect.width) * WIDTH;
                const svgY = ((e.clientY - rect.top) / rect.height) * HEIGHT;
                setTooltip({ ubigeo, nombre, x: svgX, y: svgY });
              }}
              onMouseLeave={() => setTooltip(null)}
              className="cursor-pointer"
            >
              <path
                d={d}
                fill={color}
                fillOpacity={isSelected ? 1 : 0.85}
                stroke={isSelected ? "#ffffff" : "#0f172a"}
                strokeWidth={isSelected ? 1.8 : 0.5}
                filter={
                  isSelected ? "url(#selected-glow)" : "url(#dept-shadow)"
                }
                className="transition-all duration-200 hover:fill-opacity-100"
              />

              {/* Etiquetas solo si hay espacio (ubigeo en LABEL_FULL) */}
              {lines ? (
                lines.map((line, i) => (
                  <text
                    key={i}
                    x={cx}
                    y={cy + (lines.length > 1 ? (i - 0.5) * 7 : 0)}
                    fontSize={ubigeo === "150000" || ubigeo === "250000" ? 7.5 : 6.5}
                    fontWeight="700"
                    fill="#fff"
                    fillOpacity={0.95}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="pointer-events-none"
                    style={{ textShadow: "0 1px 3px rgba(0,0,0,0.9)" }}
                    paintOrder="stroke"
                    stroke="#0f172a"
                    strokeWidth="2.5"
                    strokeLinejoin="round"
                  >
                    {line}
                  </text>
                ))
              ) : (
                <text
                  x={cx}
                  y={cy}
                  fontSize="5.5"
                  fontWeight="700"
                  fill="#fff"
                  fillOpacity={0.9}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="pointer-events-none"
                  paintOrder="stroke"
                  stroke="#0f172a"
                  strokeWidth="2"
                  strokeLinejoin="round"
                >
                  {abbr}
                </text>
              )}
            </g>
          );
        })}

        {/* Tooltip flotante */}
        {tooltip && (
          <g>
            <rect
              x={Math.min(tooltip.x + 6, WIDTH - 110)}
              y={Math.max(tooltip.y - 28, 4)}
              width={100}
              height={22}
              rx="4"
              fill="#1e293b"
              stroke="#475569"
              strokeWidth="0.5"
              fillOpacity={0.95}
            />
            <text
              x={Math.min(tooltip.x + 56, WIDTH - 60)}
              y={Math.max(tooltip.y - 13, 18)}
              fontSize="7.5"
              fontWeight="600"
              fill="#f1f5f9"
              textAnchor="middle"
              dominantBaseline="middle"
              className="pointer-events-none"
            >
              {tooltip.nombre}
            </text>
          </g>
        )}

        {/* Borde del SVG */}
        <rect
          x="1" y="1"
          width={WIDTH - 2}
          height={HEIGHT - 2}
          fill="none"
          stroke="#334155"
          strokeWidth="1"
          rx="6"
        />
      </svg>
    </div>
  );
}
