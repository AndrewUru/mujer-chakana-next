"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, BookOpen, Trash2 } from "lucide-react";
import styles from "./registros.module.css";
import { supabase } from "@/lib/supabaseClient";

// ---- Modal de confirmación ----

function ConfirmModal({
  mensaje,
  onConfirmar,
  onCancelar,
}: {
  mensaje: string;
  onConfirmar: () => void;
  onCancelar: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => { dialog.current?.showModal(); }, []);
  return (
    <dialog ref={dialog} className={styles.dialog} onCancel={onCancelar} aria-labelledby="delete-title">
      <p className={styles.eyebrow}>Tu diario personal</p>
      <h2 id="delete-title">¿Eliminar este registro?</h2>
      <p>{mensaje}</p>
      <div className={styles.actions}>
        <button type="button" onClick={onCancelar} autoFocus>Conservar</button>
        <button type="button" onClick={onConfirmar} className={styles.danger}>Sí, eliminar</button>
      </div>
    </dialog>
  );
}

// ---- Página principal ----

interface Registro {
  id: string;
  fecha: string;
  emociones?: string;
  energia?: number;
  creatividad?: number;
  espiritualidad?: number;
  notas?: string;
  mensaje?: string;
}

export default function RegistroPage() {
  const [registros, setRegistros] = useState<Registro[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [mesSeleccionado, setMesSeleccionado] = useState<string>("todos");
  const router = useRouter();
  const [registroAEliminar, setRegistroAEliminar] = useState<string | null>(
    null
  );
  const [mostrandoConfirmacion, setMostrandoConfirmacion] = useState(false);

  useEffect(() => {
    async function fetchRegistros() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/");
        return;
      }

      const { data, error } = await supabase
        .from("registros")
        .select("*")
        .eq("user_id", user.id)
        .order("fecha", { ascending: false });

      if (error) {
        console.error("Error cargando registros", error.message);
        setErrorMessage("No pudimos cargar tus registros. Intenta recargar la página.");
      } else {
        setRegistros(data || []);
      }

      setLoading(false);
    }

    fetchRegistros();
  }, [router]);

  // Agrupa meses disponibles
  const mesesDisponibles = Array.from(
    new Set(
      registros.map((r) =>
        new Date(r.fecha).toLocaleString("es-ES", {
          month: "long",
          year: "numeric",
        })
      )
    )
  );

  // Filtrar por mes
  const registrosFiltrados =
    mesSeleccionado === "todos"
      ? registros
      : registros.filter(
          (r) =>
            new Date(r.fecha).toLocaleString("es-ES", {
              month: "long",
              year: "numeric",
            }) === mesSeleccionado
        );

  // ----- Pedir confirmación antes de eliminar -----
  function pedirConfirmacion(id: string) {
    setRegistroAEliminar(id);
    setMostrandoConfirmacion(true);
  }

  // ----- Eliminar registro -----
  async function eliminarRegistro(id: string) {
    const { error } = await supabase.from("registros").delete().eq("id", id);

    if (error) {
      console.error("Error eliminando el registro:", error.message);
      setMostrandoConfirmacion(false);
      setErrorMessage("No se pudo eliminar el registro. Inténtalo de nuevo.");
      return;
    }

    setRegistros((prev) => prev.filter((r) => r.id !== id));
    setMostrandoConfirmacion(false);
  }

  return (
    <main className={styles.page}>
      <Image src="/agua-ui.webp" alt="" fill priority sizes="100vw" className={styles.backdrop} />
      <div className={styles.veil} aria-hidden="true" />
      <div className={styles.content}>
        <nav className={styles.topline}><Link href="/dashboard">Mujer Chakana / Observatorio</Link><span>Archivo personal</span></nav>
        <header className={styles.hero}>
          <div><p className={styles.eyebrow}>Lo que sientes deja huella</p><h1>La memoria<br /><em>de tu ciclo.</em></h1></div>
          <div className={styles.intro}><p>Cada registro guarda una parte de ti. Vuelve a tus palabras, reconoce tus ritmos y descubre lo que cambia con cada vuelta.</p><Link href="/dashboard">Volver a mi día <ArrowUpRight size={17} /></Link></div>
        </header>
        <div className={styles.toolbar}>
          <p aria-live="polite"><strong>{loading ? "—" : registrosFiltrados.length}</strong> {registrosFiltrados.length === 1 ? "momento guardado" : "momentos guardados"}</p>
          <label>Explorar por mes<select onChange={(e) => setMesSeleccionado(e.target.value)} value={mesSeleccionado}><option value="todos">Todos los meses</option>{mesesDisponibles.map(mes => <option key={mes} value={mes}>{mes}</option>)}</select></label>
        </div>
        {errorMessage && <p className={styles.error} role="alert">{errorMessage}</p>}
        {loading ? <div className={styles.empty} role="status">Abriendo tu diario...</div> : registrosFiltrados.length === 0 ? (
          <div className={styles.empty}><BookOpen size={32} /><h2>{registros.length ? "Este mes espera tus palabras." : "Tu historia empieza con un día."}</h2><p>{registros.length ? "Prueba otro mes para volver a tus registros." : "Registra cómo te sientes desde tu espacio personal."}</p><Link href="/dashboard">Ir a mi espacio <ArrowUpRight size={16} /></Link></div>
        ) : <div className={styles.grid}>{registrosFiltrados.map(registro => (
          <article className={styles.card} key={registro.id}>
            <header className={styles.cardHeader}><div><p>{new Date(registro.fecha).toLocaleDateString("es-ES", { month: "long", year: "numeric" })}</p><h2>{new Date(registro.fecha).toLocaleDateString("es-ES", { day: "2-digit", weekday: "long" })}</h2></div><button type="button" onClick={() => pedirConfirmacion(registro.id)} aria-label={`Eliminar registro del ${new Date(registro.fecha).toLocaleDateString("es-ES")}`}><Trash2 size={16} /></button></header>
            <p className={styles.eyebrow}>Así me sentía</p><p className={styles.emotions}>{registro.emociones || "Emociones sin registrar"}</p>
            <dl className={styles.metrics}>{[["Energía",registro.energia],["Creatividad",registro.creatividad],["Espiritualidad",registro.espiritualidad]].map(([label,value]) => <div key={label}><dt>{label}</dt><dd>{value ?? "—"}</dd></div>)}</dl>
            {registro.notas && <blockquote>{registro.notas}</blockquote>}
            {registro.mensaje && <div className={styles.reflection}><span>Reflexión del día</span><p>{registro.mensaje}</p></div>}
          </article>
        ))}</div>}
        <aside className={styles.support}><span>Acompañar tu recorrido</span><p>Las suscriptoras pueden solicitar una videoconsulta personalizada con Samari Luz para profundizar en su camino.</p></aside>
      </div>
      {mostrandoConfirmacion && registroAEliminar && <ConfirmModal mensaje="Esta acción no se puede deshacer. Puedes conservarlo y volver a leerlo cuando quieras." onConfirmar={() => eliminarRegistro(registroAEliminar)} onCancelar={() => setMostrandoConfirmacion(false)} />}
    </main>
  );
}
