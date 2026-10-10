"use client";

import { useRef, useState, type CSSProperties } from "react";
import { ArrowUpRight, BookOpen, Headphones, LoaderCircle, Pause, Play, RefreshCcw, RotateCcw, RotateCw, Volume2, VolumeX, X } from "lucide-react";
import styles from "./resource.module.css";

function safeResourceUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.href : null;
  } catch { return null; }
}

function timestamp(seconds: number) {
  const value = Number.isFinite(seconds) ? Math.max(0, Math.floor(seconds)) : 0;
  const hours = Math.floor(value / 3600);
  const minutes = Math.floor((value % 3600) / 60);
  return `${hours ? `${hours}:` : ""}${hours ? String(minutes).padStart(2, "0") : minutes}:${String(value % 60).padStart(2, "0")}`;
}

function OpenResource({ url, label = "Abrir en otra pestaña" }: { url: string; label?: string }) {
  return <a className={styles.textLink} href={url} target="_blank" rel="noopener noreferrer">{label}<ArrowUpRight size={15} aria-hidden="true" /><span className={styles.srOnly}> (nueva pestaña)</span></a>;
}

function AudioPlayer({ url, title }: { url: string; title: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const [rate, setRate] = useState("1");
  const [muted, setMuted] = useState(false);
  const [error, setError] = useState(false);
  const [ended, setEnded] = useState(false);

  async function togglePlayback() {
    const audio = audioRef.current;
    if (!audio) return;
    if (!audio.paused) { audio.pause(); return; }
    setError(false);
    setWaiting(true);
    try { await audio.play(); }
    catch (cause) {
      if (!(cause instanceof DOMException && cause.name === "AbortError")) setError(true);
      setWaiting(false);
    }
  }

  function seek(value: number) {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const next = Math.max(0, Math.min(duration, value));
    audio.currentTime = next;
    setPosition(next);
    setEnded(false);
  }

  return <div className={styles.audioPlayer}>
    <audio ref={audioRef} src={url} preload="metadata" aria-label={title}
      onLoadedMetadata={event => { const audio = event.currentTarget; setDuration(Number.isFinite(audio.duration) ? audio.duration : 0); audio.playbackRate = Number(rate); }}
      onDurationChange={event => setDuration(Number.isFinite(event.currentTarget.duration) ? event.currentTarget.duration : 0)}
      onTimeUpdate={event => setPosition(event.currentTarget.currentTime)}
      onPlay={() => { setPlaying(true); setEnded(false); }}
      onPlaying={() => setWaiting(false)}
      onPause={() => { setPlaying(false); setWaiting(false); }}
      onWaiting={() => setWaiting(true)}
      onCanPlay={() => setWaiting(false)}
      onEnded={() => { setPlaying(false); setWaiting(false); setEnded(true); }}
      onError={() => { setError(true); setPlaying(false); setWaiting(false); }}
    />
    <div className={styles.soundscape} data-playing={playing && !waiting} aria-hidden="true">
      {Array.from({ length: 45 }, (_, index) => <i key={index} style={{ "--bar-height": `${12 + ((index * 17 + 9) % 49)}px`, "--bar-delay": `${(index % 7) * -.18}s` } as CSSProperties} />)}
    </div>
    <p className={styles.playerStatus} role="status">{error ? "La reproducción no está disponible" : waiting ? "Preparando el audio…" : ended ? "Tu escucha ha terminado. Quédate un instante contigo." : playing ? "Este momento es tuyo" : position > 0 ? "En pausa. Continúa cuando quieras." : "Ponte cómoda. Empieza cuando quieras."}</p>
    <div className={styles.timeline}>
      <label htmlFor="audio-progress" className={styles.srOnly}>Posición del audio</label>
      <input id="audio-progress" type="range" min={0} max={duration || 1} step={.1} value={Math.min(position, duration || 1)} disabled={!duration || error} onChange={event => seek(Number(event.target.value))} aria-valuetext={`${timestamp(position)} de ${timestamp(duration)}`} style={{ "--progress": `${duration ? position / duration * 100 : 0}%` } as CSSProperties} />
      <div className={styles.times}><span>{timestamp(position)}</span><span>{duration ? timestamp(duration) : "—:—"}</span></div>
    </div>
    <div className={styles.transport}>
      <button type="button" className={styles.iconButton} aria-label="Retroceder 15 segundos" disabled={!duration || error} onClick={() => seek(position - 15)}><RotateCcw size={21} aria-hidden="true" /><span aria-hidden="true">15</span></button>
      <button type="button" className={styles.playButton} onClick={togglePlayback} disabled={error} aria-label={playing ? "Pausar audio" : ended ? "Volver a escuchar" : "Reproducir audio"}>{waiting ? <LoaderCircle className={styles.spinner} size={26} aria-hidden="true" /> : playing ? <Pause size={26} fill="currentColor" aria-hidden="true" /> : <Play size={26} fill="currentColor" aria-hidden="true" />}</button>
      <button type="button" className={styles.iconButton} aria-label="Avanzar 15 segundos" disabled={!duration || error} onClick={() => seek(position + 15)}><RotateCw size={21} aria-hidden="true" /><span aria-hidden="true">15</span></button>
    </div>
    <div className={styles.audioOptions}>
      <button type="button" className={styles.muteButton} aria-label={muted ? "Activar sonido" : "Silenciar audio"} aria-pressed={muted} onClick={() => { const audio = audioRef.current; if (audio) { audio.muted = !muted; setMuted(!muted); } }}>{muted ? <VolumeX size={18} aria-hidden="true" /> : <Volume2 size={18} aria-hidden="true" />}<span>{muted ? "Sin sonido" : "Sonido"}</span></button>
      <label className={styles.speed}>Velocidad<select value={rate} onChange={event => { setRate(event.target.value); if (audioRef.current) audioRef.current.playbackRate = Number(event.target.value); }}><option value="0.75">0,75×</option><option value="1">1×</option><option value="1.25">1,25×</option><option value="1.5">1,5×</option><option value="2">2×</option></select></label>
    </div>
    {error && <div className={styles.mediaError} role="alert"><p>No se pudo cargar el audio. Puedes reintentarlo o abrir el archivo directamente.</p><button className={styles.textLink} type="button" onClick={() => { setError(false); setWaiting(false); setEnded(false); setPosition(0); setDuration(0); audioRef.current?.load(); }}><RefreshCcw size={15} aria-hidden="true" /> Reintentar audio</button><OpenResource url={url} label="Abrir audio" /></div>}
    <p className={styles.listeningHint}><Headphones size={14} aria-hidden="true" /> Acompáñalo con auriculares, si lo deseas.</p>
  </div>;
}

function PdfReader({ url, title }: { url: string; title: string }) {
  const [open, setOpen] = useState(false);
  return <div className={styles.document}>
    <p>Un espacio para leer, detenerte y volver a lo que te inspira.</p>
    <div className={styles.documentActions}><button type="button" className={styles.primary} aria-expanded={open} aria-controls="resource-document" onClick={() => setOpen(value => !value)}>{open ? <X size={17} aria-hidden="true" /> : <BookOpen size={17} aria-hidden="true" />}{open ? "Cerrar lectura" : "Leer la guía aquí"}</button><OpenResource url={url} label="Abrir PDF" /></div>
    <div id="resource-document" hidden={!open}>{open && <iframe src={url} title={`Guía PDF: ${title}`} className={styles.pdf} />}</div>
    <p className={styles.fileHint}>Si tu navegador no muestra el documento, usa «Abrir PDF» para leerlo en otra pestaña.</p>
  </div>;
}

function VideoPlayer({ url, title, poster }: { url: string; title: string; poster?: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState(false);
  return <div className={styles.videoWrap}>
    <video ref={videoRef} src={url} poster={poster} controls playsInline preload="metadata" className={styles.video} aria-label={title} onError={() => setError(true)} />
    {error && <div className={styles.mediaError} role="alert"><p>No se pudo reproducir el vídeo. Vuelve a intentarlo o abre el archivo directamente.</p><button type="button" className={styles.textLink} onClick={() => { setError(false); videoRef.current?.load(); }}><RefreshCcw size={15} aria-hidden="true" /> Reintentar vídeo</button></div>}
    <OpenResource url={url} label="Abrir vídeo" />
  </div>;
}

export default function ResourceContent({ type, url, title, poster }: { type: string; url: string; title: string; poster?: string }) {
  const safeUrl = safeResourceUrl(url);
  if (!safeUrl) return <p className={styles.mediaError} role="status">El archivo todavía no está disponible. Vuelve a la biblioteca para explorar otros recursos.</p>;
  if (type === "audio") return <AudioPlayer url={safeUrl} title={title} />;
  if (type === "pdf") return <PdfReader url={safeUrl} title={title} />;
  if (type === "video") return <VideoPlayer url={safeUrl} title={title} poster={poster} />;
  return <div className={styles.document}><p>Este formato se abre en una pestaña nueva para que puedas consultarlo con comodidad.</p><OpenResource url={safeUrl} label="Abrir recurso" /></div>;
}
