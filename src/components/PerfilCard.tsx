// components/PerfilCard.tsx
import Image from "next/image";

export default function PerfilCard({
  perfil,
  day,
}: {
  perfil: { avatar_url: string | null; display_name: string };
  day: number | string;
}) {
  return (
    <div className="glass-panel mb-6 flex items-center gap-4 rounded-3xl p-4">
      {perfil.avatar_url ? (
        <Image
          src={perfil.avatar_url}
          alt="avatar"
          width={60}
          height={60}
          className="rounded-full border-2 border-white/80 object-cover shadow-[0_12px_28px_rgba(143,21,85,0.18)] ring-1 ring-rose-200/70"
        />
      ) : (
        <div className="flex h-[60px] w-[60px] items-center justify-center rounded-full border border-white/70 bg-rose-100/60 text-xl font-bold text-pink-600 shadow-inner">
          {perfil.display_name.charAt(0)}
        </div>
      )}
      <div>
        <h2 className="text-xl font-semibold text-rose-950">
          ¡Hola, {perfil.display_name}!
        </h2>
        <p className="text-sm text-pink-600">Día {day} de tu ciclo 🌕</p>
      </div>
    </div>
  );
}
