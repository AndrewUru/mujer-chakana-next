import Link from "next/link";
import { Book, Music, FileText } from "lucide-react";

export default function RecursosList({
  recursos,
}: {
  recursos: {
    id: string;
    tipo: string;
    titulo: string;
    url: string;
    descripcion: string;
  }[];
}) {
  const iconByTipo = (tipo: string) => {
    switch (tipo) {
      case "audio":
        return <Music className="w-6 h-6 text-pink-600" />;
      case "pdf":
        return <FileText className="w-6 h-6 text-pink-600" />;
      default:
        return <Book className="w-6 h-6 text-pink-600" />;
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {recursos.map((recurso) => (
        <Link
          key={recurso.id}
          href={recurso.url}
          target="_blank"
          className="bg-white p-4 rounded-2xl shadow-md hover:shadow-xl transition duration-300 flex flex-col gap-2"
        >
          <div className="flex items-center gap-3">
            {iconByTipo(recurso.tipo)}
            <h3 className="text-lg font-semibold text-rose-800">
              {recurso.titulo}
            </h3>
          </div>

          <p className="text-sm text-gray-600">{recurso.descripcion}</p>
        </Link>
      ))}
    </div>
  );
}
