import { useState } from "react";
import LunarModal from "./LunarModal.tsx";

const Moonboard = () => {
  const days = Array.from({ length: 28 }, (_, i) => i + 1);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

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

  const handleClickDay = (day: number) => {
    setSelectedDay(day);
  };

  return (
    <>
      <h2 className="text-xl font-bold text-pink-800 mb-4 text-center">
        🌸 Mi Moonboard
      </h2>
      <div className="grid grid-cols-7 gap-2 p-4 justify-center items-center">
        {days.map((day) => (
          <div
            key={day}
            className={`rounded-full w-12 h-12 flex items-center justify-center border text-sm font-semibold relative
              ${
                selectedDay === day
                  ? "bg-pink-500 text-white"
                  : "bg-white text-pink-800 border-pink-300"
              }
              hover:bg-pink-400 cursor-pointer transition`}
            onClick={() => handleClickDay(day)}
          >
            {day}
          </div>
        ))}
      </div>

      {selectedDay !== null && (
        <LunarModal
          day={selectedDay}
          fecha={calcularFechaPorDia(selectedDay)}
          onClose={() => setSelectedDay(null)}
        />
      )}
    </>
  );
};

export default Moonboard;
