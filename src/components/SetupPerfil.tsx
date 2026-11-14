"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import styles from "./SetupPerfil.module.css";
import AvatarUploader from "./AvatarUploader";
import { ELEMENT_AVATARS } from "@/lib/avatars";

/** Fecha local de hoy como AAAA-MM-DD, el formato de input[type=date]. */
function today() {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

export default function SetupPerfil() {
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [userId, setUserId] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ text: string; ok?: boolean; field?: "fecha" } | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        router.replace("/auth/login");
        return;
      }

      setUserId(user.id);

      const { data: perfil } = await supabase
        .from("perfiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (perfil) {
        setUsername(perfil.display_name || "");
        setAvatarUrl(perfil.avatar_url || "");
        setFechaInicio(perfil.fecha_inicio || "");
      }

      setLoading(false);
    };

    fetchUser();
  }, [router]);

  // Los avisos se muestran en el propio formulario, nunca con alert()/confirm().
  const fail = (text: string, field?: "fecha") => {
    setNotice({ text, field });
    setSaving(false);
  };

  const handleSave = async () => {
    if (saving) return;
    setNotice(null);

    if (!fechaInicio) {
      fail("Elige la fecha en que comenzó tu último ciclo.", "fecha");
      return;
    }

    // Se comparan fechas locales AAAA-MM-DD: new Date("AAAA-MM-DD") es UTC.
    if (fechaInicio > today()) {
      fail("Esa fecha todavía no ha llegado. Elige hoy o un día anterior.", "fecha");
      return;
    }

    setSaving(true);

    const { data: cicloExistente } = await supabase
      .from("ciclos")
      .select("*")
      .eq("usuario_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    let cicloId;

    if (cicloExistente) {
      const { error: errorUpdateCiclo } = await supabase
        .from("ciclos")
        .update({ fecha_inicio: fechaInicio })
        .eq("id", cicloExistente.id);

      if (errorUpdateCiclo) {
        console.error("Error al actualizar el ciclo:", errorUpdateCiclo.message);
        fail("No pudimos actualizar tu ciclo. Comprueba tu conexión e inténtalo de nuevo.");
        return;
      }

      cicloId = cicloExistente.id;
    } else {
      const { data: cicloNuevo, error: errorCicloNuevo } = await supabase
        .from("ciclos")
        .insert({
          usuario_id: userId,
          fecha_inicio: fechaInicio,
          duracion: 28,
          fase_actual: "agua",
          notas_generales: "Inicio del ciclo desde SetupPerfil",
        })
        .select()
        .single();

      if (errorCicloNuevo) {
        console.error("Error al crear el ciclo:", errorCicloNuevo.message);
        fail("No pudimos crear tu ciclo. Comprueba tu conexión e inténtalo de nuevo.");
        return;
      }

      cicloId = cicloNuevo.id;
    }

    const { error: errorPerfil } = await supabase
      .from("perfiles")
      .update({
        display_name: username,
        avatar_url: avatarUrl,
        fecha_inicio: fechaInicio,
        ciclo_actual: cicloId,
        perfil_completo: true,
      })
      .eq("user_id", userId);

    if (errorPerfil) {
      console.error("Error al guardar el perfil:", errorPerfil.message);
      fail("No pudimos guardar tu perfil. Comprueba tu conexión e inténtalo de nuevo.");
      return;
    }

    // El botón sigue en "Guardando…" hasta que carga el dashboard.
    setNotice({ text: "Perfil y ciclo guardados. Entrando en tu espacio…", ok: true });
    router.push("/dashboard");
  };

  if (loading)
    return (
      <p className={styles.loading} role="status">
        Cargando tu perfil sagrado...
      </p>
    );

  return (
    <div className={styles.form}>
      <div className="relative z-10">
        <label htmlFor="profile-name">
          Tu nombre o seudónimo
        </label>
        <input
          id="profile-name"
          autoComplete="nickname"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className={styles.input}
        />

        <p className={styles.label}>Tu imagen <span>(opcional)</span></p>
        <AvatarUploader
          userId={userId}
          onUpload={(url) => setAvatarUrl(url)}
          setIsUploading={setIsUploading}
        />

        <div role="group" aria-labelledby="element-avatars-label" className={styles.elements}>
          <p id="element-avatars-label">O elige un elemento</p>
          <div>
            {ELEMENT_AVATARS.map((option) => (
              <button
                key={option.id}
                type="button"
                aria-pressed={avatarUrl === option.src}
                aria-label={`Usar el avatar de ${option.label}`}
                onClick={() => setAvatarUrl(option.src)}
              >
                <Image src={option.src} alt="" width={56} height={56} />
                <span>{option.label}</span>
              </button>
            ))}
          </div>
        </div>

        {avatarUrl && (
          <Image
            src={avatarUrl}
            alt="Avatar"
            width={96}
            height={96}
            className={styles.avatar}
          />
        )}

        <label htmlFor="cycle-start">
          ¿Cuándo comenzó tu último ciclo?
        </label>
        <input
          id="cycle-start"
          aria-describedby="cycle-date-help"
          aria-invalid={notice?.field === "fecha"}
          type="date"
          max={today()}
          value={fechaInicio}
          onChange={(e) => {
            setFechaInicio(e.target.value);
            if (notice?.field === "fecha") setNotice(null);
          }}
          className={styles.input}
        />
        <p id="cycle-date-help" className={styles.help}>
          Puedes corregir esta fecha más adelante si lo necesitas.
        </p>

        {notice && (
          <p
            role={notice.ok ? "status" : "alert"}
            className={`${styles.notice} ${notice.ok ? styles.ok : ""}`}
          >
            {notice.text}
          </p>
        )}

        <button
          onClick={handleSave}
          disabled={isUploading || saving}
          className={styles.save}
          type="button"
        >
          {isUploading ? "Subiendo imagen..." : saving ? "Guardando…" : "Guardar y continuar"}
        </button>
      </div>
    </div>
  );
}
