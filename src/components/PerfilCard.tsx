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
    <div className="flex items-center gap-4 mb-6 bg-pink-50 border border-pink-100 rounded-xl p-4 shadow">
      {perfil.avatar_url ? (
        <Image
          src={perfil.avatar_url}
          alt="avatar"
          width={60}
          height={60}
          className="rounded-full object-cover border-2 border-pink-500"
        />
      ) : (
        <div className="w-[60px] h-[60px] rounded-full bg-pink-200 flex items-center justify-center text-pink-500 font-bold text-xl">
          {perfil.display_name.charAt(0)}
        </div>
      )}
      <div>
        <h2 className="text-xl font-semibold">¡Hola, {perfil.display_name}!</h2>
        <p className="text-sm text-pink-600">Día {day} de tu ciclo 🌕</p>
      </div>
    </div>
  );
}
