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
    <section className="relative w-full h-[420px] sm:h-[420px] md:h-[420px] lg:h-[520px] xl:h-[580px] 2xl:h-[580px] max-h-[600px] rounded-3xl overflow-hidden shadow-2xl bg-pink-100 mx-auto">
      <div className="relative w-full aspect-[3/4] sm:aspect-[2/3] rounded-2xl overflow-hidden">
        {data.imagen_url && (
          <Image
            src={data.imagen_url}
            alt={`Imagen del arquetipo ${data.arquetipo}`}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover transition-transform duration-700 ease-in-out hover:scale-105"
            priority
          />
        )}
      </div>

      {/* Gradiente encima de la imagen */}
      <div className="absolute inset-0 bg-gradient-to-b from-rose-100/60 via-rose-100/30 to-transparent z-10"></div>

      {/* Texto */}
      <div className="absolute inset-0 flex flex-col justify-end md:justify-center md:items-start items-center p-4 md:p-8 text-pink-900 z-20">
        <div className="bg-white/70 backdrop-blur-md rounded-xl p-3 md:p-4 shadow-lg max-w-[90%] md:max-w-[60%] lg:max-w-[50%]">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-1 text-center md:text-left">
            🌺 {data.arquetipo}
          </h2>
          <p className="text-center md:text-left">Tu arquetipo de hoy</p>
        </div>
      </div>
    </section>
  );
}
