"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, BookOpen } from "lucide-react";
import styles from "./registros.module.css";
import RitmoPorFase from "@/components/RitmoPorFase";
import RegistrosDiario, { type DiaArquetipo, type RegistroDiario } from "@/components/RegistrosDiario";
import { supabase } from "@/lib/supabaseClient";

// La fecha se guarda como AAAA-MM-DD (UTC): agruparla en UTC evita que el día 1
// de cada mes caiga en el mes anterior en husos horarios de América.
const mesDe = (fecha: string) =>
  new Date(fecha).toLocaleString("es-ES", { month: "long", year: "numeric", timeZone: "UTC" });

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

type Registro = RegistroDiario;

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
  // Contexto del ciclo: se calcula con la fecha de inicio actual del perfil.
  const [fechaInicio, setFechaInicio] = useState<string | null>(null);
  const [arquetipos, setArquetipos] = useState<Record<number, DiaArquetipo>>({});

  useEffect(() => {
    async function fetchRegistros() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/");
        return;
      }

      const [{ data, error }, { data: perfil }, { data: dias }] = await Promise.all([
        supabase
          .from("registros")
          .select("*")
          .eq("user_id", user.id)
          .order("fecha", { ascending: false }),
        supabase.from("perfiles").select("fecha_inicio").eq("user_id", user.id).maybeSingle(),
        supabase.from("mujer_chakana").select("dia_ciclo, arquetipo, elemento"),
      ]);

      setFechaInicio(perfil?.fecha_inicio ?? null);
      setArquetipos(Object.fromEntries((dias ?? []).map((dia) => [dia.dia_ciclo, dia])));

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
  const mesesDisponibles = Array.from(new Set(registros.map((r) => mesDe(r.fecha))));

  // Filtrar por mes
  const registrosFiltrados =
    mesSeleccionado === "todos"
      ? registros
      : registros.filter((r) => mesDe(r.fecha) === mesSeleccionado);

  // ----- Pedir confirmación antes de eliminar -----
  // Si se cancela, el foco vuelve al menú del registro desde el que se abrió.
  const volverFoco = useRef<HTMLButtonElement | null>(null);
  function pedirConfirmacion(id: string, trigger: HTMLButtonElement | null) {
    volverFoco.current = trigger;
    setRegistroAEliminar(id);
    setMostrandoConfirmacion(true);
  }
  function cancelarEliminacion() {
    setMostrandoConfirmacion(false);
    requestAnimationFrame(() => volverFoco.current?.focus());
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
        {!loading && !errorMessage && <RitmoPorFase registros={registrosFiltrados} periodo={mesSeleccionado} fechaInicio={fechaInicio} />}
        {errorMessage && <p className={styles.error} role="alert">{errorMessage}</p>}
        {loading ? <div className={styles.empty} role="status">Abriendo tu diario...</div> : registrosFiltrados.length === 0 ? (
          <div className={styles.empty}><BookOpen size={32} /><h2>{registros.length ? "Este mes espera tus palabras." : "Tu historia empieza con un día."}</h2><p>{registros.length ? "Prueba otro mes para volver a tus registros." : "Registra cómo te sientes desde tu espacio personal."}</p><Link href="/dashboard">Ir a mi espacio <ArrowUpRight size={16} /></Link></div>
        ) : <RegistrosDiario registros={registrosFiltrados} fechaInicio={fechaInicio} arquetipos={arquetipos} onDelete={pedirConfirmacion} />}
        <aside className={styles.support}><span>Acompañar tu recorrido</span><p>Las suscriptoras pueden solicitar una videoconsulta personalizada con Samari Luz para profundizar en su camino.</p></aside>
      </div>
      {mostrandoConfirmacion && registroAEliminar && <ConfirmModal mensaje="Esta acción no se puede deshacer. Puedes conservarlo y volver a leerlo cuando quieras." onConfirmar={() => eliminarRegistro(registroAEliminar)} onCancelar={cancelarEliminacion} />}
    </main>
  );
}
