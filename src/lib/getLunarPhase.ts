import { phase } from "lune";
import { supabase } from "./supabaseClient";

export async function getLunarPhase(fecha: string) {
  const { phase: decimalFase } = phase(new Date(fecha));

  const { data, error } = await supabase
    .from("fases_lunares")
    .select("*")
    .filter("rango_inicio", "lte", decimalFase)
    .filter("rango_fin", "gte", decimalFase)
    .limit(1);

  if (error || !data || data.length === 0) {
    console.error("Error cargando fase lunar:", error?.message || "sin datos");
    return null;
  }

  return {
    ...data[0],
    decimalFase,
  };
}
