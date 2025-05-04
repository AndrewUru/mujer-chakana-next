import Image from "next/image";

export default function EstadoActualCiclo({
  data,
}: {
  data: {
    arquetipo: string;
    elemento: string;
    imagen_url: string;
  };
}) {
  return (
    <section className="relative w-full h-[300px] md:h-[450px] max-h-[500px] rounded-3xl overflow-hidden shadow-2xl bg-pink-100 mx-auto">
      {data.imagen_url && (
        <Image
          src={data.imagen_url}
          alt={`Imagen del arquetipo ${data.arquetipo}`}
          layout="fill"
          objectFit="cover"
          className="transition-transform duration-700 ease-in-out hover:scale-105"
          priority
        />
      )}

      {/* Gradiente encima de la imagen */}
      <div className="absolute inset-0 bg-gradient-to-b from-rose-100/60 via-rose-100/30 to-transparent"></div>

      {/* Texto arriba */}
      <div className="absolute inset-0 flex flex-col justify-end p-8 text-pink-900">
        <div className="bg-white/70 backdrop-blur-md rounded-xl p-4 shadow-lg">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-1">
            🌺 {data.arquetipo}
          </h2>
          <p>Tu arquetipo de hoy</p>
        </div>
      </div>
    </section>
  );
}
