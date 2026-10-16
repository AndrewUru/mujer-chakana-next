export const calcularDiaCiclo = (startDate: string): number => {
  const hoy = new Date();
  const inicio = new Date(startDate);
  const diferenciaDias = Math.floor(
    (hoy.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diferenciaDias < 0) return 1; // Previene errores si la fecha está mal
  if (diferenciaDias === 0) return 1;

  return (diferenciaDias % 28) + 1;
};

export const DIAS_CICLO = 28;
const DIA_MS = 86_400_000;

export type FaseCiclo = "Menstrual" | "Folicular" | "Ovulatoria" | "Lútea";

export const faseDelDia = (dia: number): FaseCiclo =>
  dia <= 7 ? "Menstrual" : dia <= 14 ? "Folicular" : dia <= 21 ? "Ovulatoria" : "Lútea";

/**
 * Día, vuelta y fase del ciclo en una fecha (AAAA-MM-DD), según la fecha de
 * inicio actual del perfil. Devuelve null si la fecha es anterior al inicio:
 * el modelo de 28 días no define días previos.
 */
export function cicloEnFecha(inicio: string, fecha: string) {
  const dias = Math.floor((Date.parse(fecha.slice(0, 10)) - Date.parse(inicio.slice(0, 10))) / DIA_MS);
  if (!Number.isFinite(dias) || dias < 0) return null;
  const dia = (dias % DIAS_CICLO) + 1;
  return { dia, vuelta: Math.floor(dias / DIAS_CICLO) + 1, fase: faseDelDia(dia) };
}
