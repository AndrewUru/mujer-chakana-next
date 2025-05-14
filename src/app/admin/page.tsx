"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

interface Usuario {
  user_id: string;
  display_name: string;
  email: string; // Added email property
  rol: string;
  suscripcion_activa: boolean;
  tipo_plan?: string; // Added tipo_plan property
  fecha_inicio?: string; // <-- agregar esto
  fecha_expiracion?: string; // <-- y esto también
}

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState<string | null>(null);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  const [mensajeError, setMensajeError] = useState<string | null>(null);

  useEffect(() => {
    async function checkAdminAndFetchUsers() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth/login");
        return;
      }

      const { data: perfil, error } = await supabase
        .from("perfiles")
        .select("rol, display_name")
        .eq("user_id", user.id)
        .single();

      if (error || !perfil || perfil.rol !== "admin") {
        router.push("/dashboard");
        return;
      }

      setUserName(perfil.display_name);

      const { data: usersData, error: errorUsers } = await supabase
        .from("perfiles")
        .select(
          "user_id, email, display_name, rol, tipo_plan, suscripcion_activa"
        )
        .returns<Usuario[]>();

      if (errorUsers) {
        setMensajeError("No se pudo cargar la lista de usuarias.");
      } else if (usersData) {
        setUsuarios(usersData);
      }

      setLoading(false);
    }

    checkAdminAndFetchUsers();
  }, [router]);

  const toggleSuscripcion = async (userId: string, estadoActual: boolean) => {
    const { error } = await supabase
      .from("perfiles")
      .update({ suscripcion_activa: !estadoActual })
      .eq("user_id", userId);

    if (!error) {
      setUsuarios((prev) =>
        prev.map((u) =>
          u.user_id === userId ? { ...u, suscripcion_activa: !estadoActual } : u
        )
      );
      setMensajeExito(
        `La suscripción de ${userId.slice(0, 8)}… se actualizó correctamente.`
      );
      setTimeout(() => setMensajeExito(null), 4000);
    } else {
      setMensajeError("No se pudo actualizar la suscripción.");
      setTimeout(() => setMensajeError(null), 4000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-pink-700 bg-pink-50">
        Cargando acceso de administradora...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-pink-100 px-6 py-10">
      <div className="max-w-6xl mx-auto space-y-10">
        <header className="text-center">
          <h1 className="text-4xl font-extrabold text-pink-800">
            🌟 Admin Dashboard
          </h1>
          <p className="text-pink-600 text-lg mt-2">Bienvenida, {userName}</p>
        </header>

        {/* Mensajes de éxito o error */}
        {mensajeExito && (
          <div className="bg-green-100 border border-green-400 text-green-800 px-4 py-3 rounded relative shadow">
            {mensajeExito}
          </div>
        )}

        {mensajeError && (
          <div className="bg-red-100 border border-red-400 text-red-800 px-4 py-3 rounded relative shadow">
            {mensajeError}
          </div>
        )}

        <section className="bg-white/60 backdrop-blur-md rounded-2xl shadow-lg border border-pink-200 p-6">
          <h2 className="text-2xl font-bold text-pink-700 mb-4">
            👥 Usuarios Registrados
          </h2>

          <div className="overflow-x-auto rounded-xl">
            <table className="w-full border border-pink-100 text-sm text-pink-900 bg-white/90 shadow-inner">
              <thead className="bg-pink-100 text-pink-800">
                <tr>
                  <th className="py-3 px-4 border-b text-left">Nombre</th>
                  <th className="py-3 px-4 border-b text-left">Correo</th>
                  <th className="py-3 px-4 border-b text-left">Rol</th>
                  <th className="py-3 px-4 border-b text-left">Plan</th>
                  <th className="py-3 px-4 border-b text-left">Inicio</th>
                  <th className="py-3 px-4 border-b text-left">Vencimiento</th>
                  <th className="py-3 px-4 border-b text-center">
                    Suscripción
                  </th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((usuario) => (
                  <tr
                    key={usuario.user_id}
                    className="hover:bg-pink-50 transition-all"
                  >
                    <td className="px-4 py-2 border-b font-medium">
                      {usuario.display_name || "—"}
                    </td>
                    <td className="px-4 py-2 border-b text-sm text-gray-600">
                      {usuario.email || "—"}
                    </td>
                    <td className="px-4 py-2 border-b capitalize">
                      {usuario.rol}
                    </td>
                    <td className="px-4 py-2 border-b capitalize text-pink-700 font-semibold">
                      {usuario.tipo_plan || "—"}
                    </td>
                    <td className="px-4 py-2 border-b text-sm">
                      {usuario.fecha_inicio
                        ? new Date(usuario.fecha_inicio).toLocaleDateString()
                        : "—"}
                    </td>
                    <td className="px-4 py-2 border-b text-sm text-gray-500">
                      {usuario.fecha_expiracion
                        ? new Date(
                            usuario.fecha_expiracion
                          ).toLocaleDateString()
                        : "—"}
                    </td>
                    <td className="px-4 py-2 border-b text-center">
                      <button
                        onClick={() =>
                          toggleSuscripcion(
                            usuario.user_id,
                            usuario.suscripcion_activa
                          )
                        }
                        className={`px-3 py-1 rounded-full text-sm font-semibold transition ${
                          usuario.suscripcion_activa
                            ? "bg-green-100 text-green-700 hover:bg-green-200"
                            : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                        }`}
                      >
                        {usuario.suscripcion_activa ? "Activa" : "No activa"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="text-center mt-10">
          <h3 className="text-lg text-pink-700 font-semibold mb-3">
            Accesos rápidos de edición
          </h3>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="/admin/mujer-chakana"
              className="px-6 py-3 rounded-xl bg-pink-600 text-white hover:bg-pink-700 font-semibold shadow transition"
            >
              ✨ Editar Mujer Chakana
            </a>
            <a
              href="/admin/recursos"
              className="px-6 py-3 rounded-xl bg-rose-400 text-white hover:bg-rose-500 font-semibold shadow transition"
            >
              🔮 Editar Recursos
            </a>
            <a
              href="/admin/moonboard"
              className="px-6 py-3 rounded-xl bg-rose-400 text-white hover:bg-rose-500 font-semibold shadow transition"
            >
              🔮 Editar Moonboard
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}
