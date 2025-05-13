import { phase } from "lune";
import { supabase } from "./supabaseClient"; // asegúrate de importar bien

export async function getLunarPhase(fecha: string) {
  const { phase: decimalFase } = phase(new Date(fecha));

  const { data, error } = await supabase
    .from("fases_lunares")
    .select("*")
    .lte("rango_inicio", decimalFase)
    .gte("rango_fin", decimalFase)
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
