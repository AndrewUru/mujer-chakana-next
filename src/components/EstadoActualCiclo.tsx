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
    <section className="relative w-full h-[280px] sm:h-[320px] md:h-[450px] max-h-[500px] rounded-3xl overflow-hidden shadow-2xl bg-pink-100 mx-auto">
      {data.imagen_url && (
        <Image
          src={data.imagen_url}
          alt={`Imagen del arquetipo ${data.arquetipo}`}
          fill
          className="object-cover transition-transform duration-700 ease-in-out hover:scale-105"
          priority
        />
      )}

      {/* Gradiente encima de la imagen */}
      <div className="absolute inset-0 bg-gradient-to-b from-rose-100/60 via-rose-100/30 to-transparent"></div>

      {/* Texto (ajustado según tamaño de pantalla) */}
      <div className="absolute inset-0 flex flex-col justify-end md:justify-center md:items-start items-center p-4 md:p-8 text-pink-900">
        <div className="bg-white/70 backdrop-blur-md rounded-xl p-3 md:p-4 shadow-lg max-w-[90%] md:max-w-[60%]">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-1 text-center md:text-left">
            🌺 {data.arquetipo}
          </h2>
          <p className="text-center md:text-left">Tu arquetipo de hoy</p>
        </div>
      </div>
    </section>
  );
}
