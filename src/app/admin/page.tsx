"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Breadcrumbs from "@/components/Breadcrumbs";

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-white to-pink-100">
        <div className="flex flex-col items-center gap-3">
          <span className="animate-spin rounded-full h-8 w-8 border-4 border-pink-400 border-t-transparent"></span>
          <span className="text-pink-700 font-medium">
            Cargando acceso de administradora...
          </span>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-pink-100 px-2 py-8 pb-24">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="text-center space-y-1">
          <Breadcrumbs
            items={[
              { label: "Admin", href: "/admin" },
              { label: "Usuarios" }, // página actual (sin href)
            ]}
          />
          <h1 className="text-3xl sm:text-4xl font-extrabold text-pink-800 drop-shadow">
            🌟 Admin Dashboard
          </h1>
          <p className="text-pink-600 text-base sm:text-lg mt-1">
            Bienvenida, <span className="font-semibold">{userName}</span>
          </p>
        </header>

        {/* Mensajes de éxito o error */}
        <div className="space-y-2">
          {mensajeExito && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-lg shadow text-sm font-medium">
              <span>✅</span> <span>{mensajeExito}</span>
            </div>
          )}
          {mensajeError && (
            <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-2 rounded-lg shadow text-sm font-medium">
              <span>⚠️</span> <span>{mensajeError}</span>
            </div>
          )}
        </div>

        <section className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-pink-100 p-5 overflow-x-auto">
          <h2 className="text-xl sm:text-2xl font-bold text-pink-700 mb-4 flex items-center gap-2">
            <span className="text-2xl">👥</span> Usuarios Registrados
          </h2>
          <div className="overflow-x-auto rounded-xl">
            <table className="w-full border border-pink-50 text-xs sm:text-sm text-pink-900 bg-white/90 shadow-inner">
              <thead className="bg-pink-100 text-pink-800 sticky top-0 z-10">
                <tr>
                  <th className="py-2 px-3 border-b font-semibold text-left">
                    Nombre
                  </th>
                  <th className="py-2 px-3 border-b font-semibold text-left">
                    Correo
                  </th>
                  <th className="py-2 px-3 border-b font-semibold text-left">
                    Rol
                  </th>
                  <th className="py-2 px-3 border-b font-semibold text-left">
                    Plan
                  </th>
                  <th className="py-2 px-3 border-b font-semibold text-left">
                    Inicio
                  </th>
                  <th className="py-2 px-3 border-b font-semibold text-left">
                    Vencimiento
                  </th>
                  <th className="py-2 px-3 border-b font-semibold text-center">
                    Suscripción
                  </th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((usuario, i) => (
                  <tr
                    key={usuario.user_id}
                    className={`transition-all ${
                      i % 2 === 0 ? "bg-white" : "bg-pink-50"
                    } hover:bg-pink-100`}
                  >
                    <td className="px-3 py-2 border-b font-medium max-w-[120px] truncate">
                      {usuario.display_name || "—"}
                    </td>
                    <td className="px-3 py-2 border-b text-xs text-gray-600 max-w-[160px] truncate">
                      {usuario.email || "—"}
                    </td>
                    <td className="px-3 py-2 border-b capitalize">
                      {usuario.rol}
                    </td>
                    <td className="px-3 py-2 border-b capitalize text-pink-700 font-semibold">
                      {usuario.tipo_plan || "—"}
                    </td>
                    <td className="px-3 py-2 border-b text-xs">
                      {usuario.fecha_inicio
                        ? new Date(usuario.fecha_inicio).toLocaleDateString()
                        : "—"}
                    </td>
                    <td className="px-3 py-2 border-b text-xs text-gray-500">
                      {usuario.fecha_expiracion
                        ? new Date(
                            usuario.fecha_expiracion
                          ).toLocaleDateString()
                        : "—"}
                    </td>
                    <td className="px-3 py-2 border-b text-center">
                      <button
                        onClick={() =>
                          toggleSuscripcion(
                            usuario.user_id,
                            usuario.suscripcion_activa
                          )
                        }
                        className={`px-3 py-1 rounded-full text-xs font-semibold shadow-sm border transition
                          ${
                            usuario.suscripcion_activa
                              ? "bg-green-100 text-green-700 border-green-200 hover:bg-green-200"
                              : "bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200"
                          }
                        `}
                        title="Cambiar estado de suscripción"
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
          <h3 className="text-base sm:text-lg text-pink-700 font-semibold mb-3">
            Accesos rápidos de edición
          </h3>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="/admin/mujer-chakana"
              className="px-5 py-2.5 rounded-xl bg-pink-600 text-white hover:bg-pink-700 font-semibold shadow transition text-sm"
            >
              ✨ Editar Mujer Chakana
            </a>
            <a
              href="/admin/recursos"
              className="px-5 py-2.5 rounded-xl bg-rose-400 text-white hover:bg-rose-500 font-semibold shadow transition text-sm"
            >
              🔮 Editar Recursos
            </a>
            <a
              href="/admin/moonboard"
              className="px-5 py-2.5 rounded-xl bg-rose-400 text-white hover:bg-rose-500 font-semibold shadow transition text-sm"
            >
              🌙 Editar Moonboard
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}
