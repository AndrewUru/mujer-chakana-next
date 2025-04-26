import Image from "next/image";

export default function EstadoActualCiclo({
  data,
}: {
  data: {
    arquetipo: string;
    elemento: string;
    descripcion: string;
    imagen_url: string;
  };
}) {
  return (
    <div className="bg-white/80 backdrop-blur-md shadow-lg rounded-3xl p-6 space-y-6">
      <h2 className="text-2xl font-bold text-fuchsia-700 flex items-center gap-3">
        🌺 Arquetipo: {data.arquetipo}
      </h2>

      <p className="uppercase text-xs font-semibold tracking-wider text-pink-500">
        Elemento: {data.elemento}
      </p>

      {data.imagen_url && (
        <div className="overflow-hidden rounded-2xl">
          <Image
            src={data.imagen_url}
            alt={`Imagen del arquetipo ${data.arquetipo}`}
            className="object-cover hover:scale-105 transition-transform duration-300"
            width={500}
            height={250}
          />
        </div>
      )}

      <p className="text-base leading-relaxed text-gray-700">
        {data.descripcion}
      </p>
    </div>
  );
}
