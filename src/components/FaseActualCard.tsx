const getFaseColor = (nombre: string) => {
  switch (nombre?.toLowerCase()) {
    case "agua":
      return "bg-blue-100 text-blue-700";
    case "tierra":
      return "bg-green-100 text-green-800";
    case "fuego":
      return "bg-red-100 text-red-700";
    case "aire":
      return "bg-yellow-100 text-yellow-700";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

interface Fase {
  nombre_fase: string;
  resumen_emocional: string;
}

interface FaseActualCardProps {
  fase: Fase;
}

export default function FaseActualCard({ fase }: FaseActualCardProps) {
  return (
    <div
      className={`mt-6 p-4 rounded-xl shadow-md ${getFaseColor(
        fase.nombre_fase
      )}`}
    >
      <h3 className="text-lg font-bold">🔮 Fase actual: {fase.nombre_fase}</h3>
      <p className="mt-2">{fase.resumen_emocional}</p>
    </div>
  );
}
