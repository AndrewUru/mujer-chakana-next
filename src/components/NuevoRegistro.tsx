"use client";

import { useMemo, useState, type CSSProperties, type FormEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  CheckCircle, Feather, Flame, Heart, HeartHandshake, Leaf, MoonStar,
  Palette, Send, Sparkles, Sun, Zap, type LucideIcon,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "./Toast";
import styles from "./NuevoRegistro.module.css";

interface Props {
  userId: string;
  nombre: string;
  dia_ciclo: number;
  ciclo_actual: number;
  arquetipo: string;
}

interface SliderConfig {
  id: string;
  label: string;
  value: number;
  setter: (value: number) => void;
  icon: LucideIcon;
}

const FEELINGS: ReadonlyArray<{ label: string; Icon: LucideIcon }> = [
  { label: "Serena", Icon: Leaf }, { label: "Agradecida", Icon: HeartHandshake },
  { label: "Creativa", Icon: Palette }, { label: "Intensa", Icon: Flame },
  { label: "Introspectiva", Icon: MoonStar }, { label: "Radiante", Icon: Sun },
];
const EMOTIONS_LIMIT = 500;
const NOTES_LIMIT = 320;

function describeLevel(label: string, value: number) {
  if (value <= 2) return `${label} en modo semilla: escucha el descanso.`;
  if (value === 3) return `${label} en equilibrio: sostén un ritmo amable.`;
  if (value === 4) return `${label} despierta y disponible hoy.`;
  return `${label} expansiva: canalízala con intención.`;
}

export default function NuevoRegistro({ userId, nombre, dia_ciclo, ciclo_actual, arquetipo }: Props) {
  const reduceMotion = useReducedMotion();
  const { addToast } = useToast();
  const [emociones, setEmociones] = useState("");
  const [selectedFeelings, setSelectedFeelings] = useState<string[]>([]);
  const [energia, setEnergia] = useState(3);
  const [creatividad, setCreatividad] = useState(3);
  const [espiritualidad, setEspiritualidad] = useState(3);
  const [notas, setNotas] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);
  const [success, setSuccess] = useState(false);

  const today = useMemo(() => new Date().toLocaleDateString("es-ES", {
    weekday: "long", day: "2-digit", month: "long",
  }), []);
  const average = Math.round((energia + creatividad + espiritualidad) / 3);
  const vital = average <= 2
    ? { title: "Modo semilla", copy: "Menos exigencia. Más escucha y cuidado." }
    : average === 3
      ? { title: "Punto de equilibrio", copy: "Un ritmo amable puede sostenerte hoy." }
      : { title: "Expansión creativa", copy: "Hay energía disponible: dale un cauce." };

  const sliders: SliderConfig[] = [
    { id: "energia", label: "Energía", value: energia, setter: setEnergia, icon: Zap },
    { id: "creatividad", label: "Creatividad", value: creatividad, setter: setCreatividad, icon: Palette },
    { id: "espiritualidad", label: "Espiritualidad", value: espiritualidad, setter: setEspiritualidad, icon: Sparkles },
  ];

  const combinedEmotions = [emociones.trim(), ...selectedFeelings].filter(Boolean).join(" · ");

  function toggleFeeling(feeling: string) {
    setSelectedFeelings((current) => current.includes(feeling)
      ? current.filter((item) => item !== feeling)
      : [...current, feeling]);
  }

  async function handleGuardar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!combinedEmotions) {
      addToast("error", "Describe una emoción o elige al menos una palabra");
      return;
    }

    setCargando(true);
    addToast("loading", "Guardando tu huella y preparando la reflexión...");
    const fecha = new Date().toISOString().split("T")[0];

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error("La sesión ha caducado.");

      const { data: registro, error } = await supabase.from("registros").insert([{
        fecha, emociones: combinedEmotions, energia, creatividad, espiritualidad, notas, user_id: userId,
      }]).select("id").single();
      if (error || !registro) throw new Error("No se pudo guardar el registro.");

      let finalMessage = "Tu registro quedó guardado. Samari retomará la reflexión cuando vuelva a estar disponible.";
      try {
        const response = await fetch("/api/generar-mensaje", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
          body: JSON.stringify({ nombre, emociones: combinedEmotions, energia, creatividad, espiritualidad, notas, dia_ciclo, ciclo_actual, arquetipo }),
        });
        if (!response.ok) throw new Error("Samari no pudo crear la reflexión.");
        const data = await response.json();
        finalMessage = data.mensaje || finalMessage;
        if (data.mensaje) await supabase.from("registros").update({ mensaje: data.mensaje }).eq("id", registro.id);
        addToast("success", "Registro guardado y reflexión generada");
      } catch (reflectionError) {
        console.error("Error generando la reflexión:", reflectionError);
        addToast("info", "Tu registro está guardado, aunque Samari no pudo responder ahora.");
      }

      setMensaje(finalMessage);
      setEmociones(""); setSelectedFeelings([]); setNotas(""); setSuccess(true);
      window.setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error("Error en handleGuardar:", error);
      addToast("error", error instanceof Error ? error.message : "Ocurrió un error inesperado.");
    } finally { setCargando(false); }
  }

  return (
    <motion.form className={styles.journal} onSubmit={handleGuardar} initial={reduceMotion ? false : { opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .55 }}>
      <header className={styles.header}>
        <div><p>Bitácora ritual · Día {String(dia_ciclo).padStart(2, "0")}</p><h2>Deja una huella de cómo estás.</h2><span>Hola, {nombre}. No hace falta explicarlo todo; basta con nombrar lo verdadero.</span></div>
        <div className={styles.context}><small>{today}</small><strong>{arquetipo}</strong><span>Vuelta {ciclo_actual}</span></div>
      </header>

      <div className={styles.layout}>
        <div className={styles.steps}>
          <section className={styles.step} aria-labelledby="step-emotions">
            <div className={styles.stepIntro}><span>01</span><div><h3 id="step-emotions">Nombrar</h3><p>¿Qué emociones están presentes?</p></div></div>
            <div className={styles.field}>
              <label htmlFor="emociones"><Heart /> Escríbelo con tus palabras</label>
              <textarea id="emociones" value={emociones} onChange={(event) => setEmociones(event.target.value)} placeholder="Hoy me siento..." maxLength={EMOTIONS_LIMIT} rows={4} />
              <small>{emociones.length}/{EMOTIONS_LIMIT}</small>
            </div>
            <div className={styles.feelings} aria-label="Palabras emocionales sugeridas">
              {FEELINGS.map(({ label, Icon }) => {
                const active = selectedFeelings.includes(label);
                return <button key={label} type="button" className={active ? styles.feelingActive : styles.feeling} aria-pressed={active} onClick={() => toggleFeeling(label)}><Icon />{label}</button>;
              })}
            </div>
          </section>

          <section className={styles.step} aria-labelledby="step-levels">
            <div className={styles.stepIntro}><span>02</span><div><h3 id="step-levels">Medir</h3><p>Escucha el volumen de tu mundo interno.</p></div></div>
            <div className={styles.sliders}>
              {sliders.map(({ id, label, value, setter, icon: Icon }) => (
                <div className={styles.sliderRow} key={id}>
                  <label htmlFor={id}><Icon /><span>{label}<small>{describeLevel(label, value)}</small></span><strong>{value}</strong></label>
                  <input id={id} type="range" min="1" max="5" value={value} onChange={(event) => setter(Number(event.target.value))} style={{ "--level": `${((value - 1) / 4) * 100}%` } as CSSProperties} aria-valuetext={`${value} de 5`} />
                  <div className={styles.scale}><span>Semilla</span><span>Expansión</span></div>
                </div>
              ))}
            </div>
          </section>

          <section className={styles.step} aria-labelledby="step-notes">
            <div className={styles.stepIntro}><span>03</span><div><h3 id="step-notes">Dejar señal</h3><p>Sueños, símbolos, cuerpo o intuiciones.</p></div></div>
            <div className={styles.field}>
              <label htmlFor="notas"><Feather /> Algo que quieras recordar</label>
              <textarea id="notas" value={notas} onChange={(event) => setNotas(event.target.value)} placeholder="Soñé con agua, sentí una idea insistente..." maxLength={NOTES_LIMIT} rows={4} />
              <small>{notas.length}/{NOTES_LIMIT}</small>
            </div>
          </section>
        </div>

        <aside className={styles.pulse}>
          <p>Lectura del pulso</p>
          <div className={styles.score} style={{ "--score": `${average * 20}%` } as CSSProperties}><div><strong>{average}</strong><span>de 5</span></div></div>
          <h3>{vital.title}</h3><p className={styles.pulseCopy}>{vital.copy}</p>
          <div className={styles.pulseValues}>{sliders.map(({ id, label, value }) => <span key={id}><small>{label}</small><strong>{value}/5</strong></span>)}</div>
          <button className={styles.submit} type="submit" disabled={cargando || success} aria-busy={cargando}>
            {cargando ? <><i /> Escuchando tu registro...</> : success ? <><CheckCircle /> Huella guardada</> : <><Send /> Guardar y escuchar a Samari</>}
          </button>
          <small className={styles.privacy}>Tu registro es privado y se guarda en tu cuenta.</small>
        </aside>
      </div>

      <AnimatePresence>
        {mensaje && <motion.section className={styles.response} initial={reduceMotion ? false : { opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} role="status" aria-live="polite">
          <div><Sparkles /><span>Samari · Reflejo del día</span></div><p>{mensaje}</p>
        </motion.section>}
      </AnimatePresence>
    </motion.form>
  );
}
