import { useEffect, useState } from "react";
import RegisterModal from "./RegisterModal";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Registro = {
  id?: string;
  fecha: string;
  emociones?: string;
  energia?: number;
  creatividad?: number;
  espiritualidad?: number;
  notas?: string;
};

const Moonboard = () => {
  const days = Array.from({ length: 28 }, (_, i) => i + 1);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [registro, setRegistro] = useState<Registro | undefined>(undefined);
  const [registrosGuardados, setRegistrosGuardados] = useState<
    Record<number, string>
  >({});

  // 🌙 Cálculo de fecha del día del ciclo
  const calcularFechaPorDia = (dia: number) => {
    const inicioCiclo = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1
    );
    const fecha = new Date(inicioCiclo);
    fecha.setDate(inicioCiclo.getDate() + dia - 1);
    return fecha.toISOString().split("T")[0];
  };

  // 🔁 Cargar todos los registros
  const fetchAll = async () => {
    const { data, error } = await supabase.from("registros").select("*");
    if (!error && data) {
      const mapa: Record<number, string> = {};
      data.forEach((registro) => {
        const fecha = new Date(registro.fecha);
        const dia = fecha.getDate(); // ciclo simple (1–28)
        mapa[dia] = registro.id;
      });
      setRegistrosGuardados(mapa);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleClickDay = async (day: number) => {
    const fechaStr = calcularFechaPorDia(day);
    const { data, error } = await supabase
      .from("registros")
      .select("*")
      .eq("fecha", fechaStr)
      .single();

    setRegistro(!error && data ? data : undefined);
    setSelectedDay(day);
  };

  return (
    <>
      <h2 className="text-xl font-bold text-pink-800 mb-4 text-center">
        🌸 Mi Moonboard
      </h2>
      <div className="grid grid-cols-7 gap-2 p-4 justify-center items-center">
        {days.map((day) => {
          const isSelected = selectedDay === day;
          const isGuardado = registrosGuardados[day];

          return (
            <div
              key={day}
              className={`rounded-full w-12 h-12 flex items-center justify-center border text-sm font-semibold relative
                ${
                  isSelected
                    ? "bg-pink-500 text-white"
                    : isGuardado
                    ? "bg-pink-300 text-white"
                    : "bg-white text-pink-800 border-pink-300"
                }
                hover:bg-pink-400 cursor-pointer transition`}
              onClick={() => handleClickDay(day)}
            >
              {day}
              {isGuardado && (
                <span className="absolute top-0 right-0 text-xs text-white">
                  🌸
                </span>
              )}
            </div>
          );
        })}
      </div>

      {selectedDay !== null && (
        <RegisterModal
          day={selectedDay}
          fecha={calcularFechaPorDia(selectedDay)}
          registro={registro}
          onClose={async () => {
            setSelectedDay(null);
            setRegistro(undefined);
            await fetchAll(); // 🔁 refresca el tablero
          }}
        />
      )}
    </>
  );
};

export default Moonboard;
