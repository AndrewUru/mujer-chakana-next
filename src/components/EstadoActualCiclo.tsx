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
    <section className="glass-panel relative mx-auto h-[420px] max-h-[600px] w-full overflow-hidden rounded-3xl sm:h-[420px] md:h-[480px] lg:h-[520px] xl:h-[580px] 2xl:h-[580px]">
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
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/45 via-rose-100/24 to-transparent" />
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-10 h-32 bg-gradient-to-t from-white/78 via-white/42 to-transparent md:h-40" />
      </div>

      {/* Contenido con mejor posicionamiento */}
      <div className="relative z-20 flex h-full flex-col items-center justify-end p-4 text-pink-900 md:items-start md:justify-center md:p-6 lg:p-8">
        <div className="glass w-[min(92%,24rem)] rounded-3xl p-4 md:w-[min(68%,26rem)] md:p-5 lg:w-[min(58%,28rem)] 2xl:w-[min(52%,30rem)]">
          <h2 className="mb-1 max-w-full text-balance text-center text-[clamp(1.8rem,7vw,3rem)] font-extrabold leading-[0.98] drop-shadow-sm [overflow-wrap:anywhere] md:text-left lg:text-[clamp(2.1rem,3.2vw,3.5rem)]">
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
