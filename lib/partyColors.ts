/**
 * Colores institucionales de los partidos políticos
 * Elecciones Generales Perú 2026
 * Clave: codigoAgrupacionPolitica del API ONPE
 */
export const PARTY_COLORS: Record<number, string> = {
  1:  "#0055A4", // Alianza para el Progreso
  2:  "#E31E24", // Ahora Nación - AN
  3:  "#C2410C", // Alianza Electoral Venceremos
  4:  "#FF1493", // Perú Moderno
  5:  "#008000", // Fe en el Perú
  6:  "#6B7280", // (reservado)
  7:  "#003399", // Avanza País - Partido de Integración Social
  8:  "#FF6600", // Fuerza Popular
  9:  "#B91C1C", // Fuerza y Libertad
  10: "#E31E24", // Juntos por el Perú
  11: "#FFD200", // Libertad Popular
  12: "#CC0000", // Partido Aprista Peruano
  13: "#6B7280", // (reservado)
  14: "#2563EB", // Partido Cívico Obras
  15: "#D97706", // Partido de los Trabajadores y Emprendedores PTE-Perú
  16: "#FFCC00", // Partido del Buen Gobierno
  17: "#7C3AED", // Partido Demócrata Unido Perú
  18: "#16A34A", // Partido Demócrata Verde
  19: "#0891B2", // Partido Democrático Federal
  20: "#E31E24", // Partido Democrático Somos Perú
  21: "#009639", // Partido Frente de la Esperanza 2021
  22: "#5F2167", // Partido Morado
  23: "#374151", // Partido País para Todos
  24: "#6D28D9", // Partido Patriótico del Perú
  25: "#D20A11", // Partido Político Cooperación Popular (Acción Popular)
  26: "#0369A1", // Partido Político Integridad Democrática
  27: "#E31E24", // Partido Político Nacional Perú Libre
  28: "#D20A11", // Partido Político Perú Acción
  29: "#EA580C", // Partido Político Perú Primero
  30: "#7C3AED", // Partido Político PRIN
  31: "#D97706", // Partido Sicreo
  32: "#00539C", // Podemos Perú
  33: "#FF8C00", // Primero la Gente
  34: "#059669", // Progresemos
  35: "#00ADEF", // Renovación Popular
  36: "#DC2626", // Salvemos al Perú
  37: "#DB2777", // Un Camino Diferente
  38: "#1D4ED8", // Unidad Nacional
};

export function getPartyColor(codigo: number): string {
  return PARTY_COLORS[codigo] || "#64748b";
}
