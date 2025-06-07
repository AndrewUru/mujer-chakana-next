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
    <section className="relative w-full h-[420px] sm:h-[420px] md:h-[480px] lg:h-[520px] xl:h-[580px] 2xl:h-[580px] max-h-[600px] rounded-3xl overflow-hidden shadow-2xl bg-pink-100 mx-auto">
      <div className="absolute inset-0 z-0">
        {data.imagen_url && (
          <Image
            src={data.imagen_url}
            alt={`Imagen del arquetipo ${data.arquetipo}`}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 90vw, (max-width: 1536px) 80vw, 1200px"
            className="
              object-cover 
              object-center
              sm:object-[center_top]
              md:object-center
              lg:object-[center_20%]
              xl:object-center
              transition-transform duration-700 ease-in-out
              group-hover:scale-105
              will-change-transform
            "
            priority
          />
        )}
        {/* Gradiente ajustado para mejor legibilidad */}
        <div className="absolute inset-0 bg-gradient-to-br from-rose-100/60 via-rose-100/30 to-transparent pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-32 md:h-40 bg-gradient-to-t from-white/85 via-white/50 to-transparent z-10 pointer-events-none" />
      </div>

      {/* Contenido con mejor posicionamiento */}
      <div className="relative z-20 flex flex-col justify-end md:justify-center md:items-start items-center h-full p-4 md:p-6 lg:p-8 text-pink-900">
        <div className="bg-white/75 backdrop-blur-md rounded-xl p-3 md:p-4 lg:p-5 shadow-lg max-w-[90%] md:max-w-[65%] lg:max-w-[55%] xl:max-w-[50%]">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold mb-1 text-center md:text-left drop-shadow-sm">
            🌺 {data.arquetipo}
          </h2>
          <p className="text-center md:text-left font-medium text-sm md:text-base">
            Tu arquetipo de hoy
          </p>
        </div>
      </div>
    </section>
  );
}
