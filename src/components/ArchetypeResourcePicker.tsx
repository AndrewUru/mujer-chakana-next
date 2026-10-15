"use client";

import { useEffect, useId, useRef, useState } from "react";
import { resourceOptions, validateArchetypeResource, type ResourceKind } from "@/lib/archetypeResources";
import styles from "./ArchetypeImagePicker.module.css";

type Props = {
  kind: ResourceKind;
  currentUrl?: string | null;
  file: File | null;
  disabled?: boolean;
  onChange: (file: File | null) => void;
};

export default function ArchetypeResourcePicker({ kind, currentUrl, file, disabled, onChange }: Props) {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const options = resourceOptions[kind];
  useEffect(() => {
    if (!file) { setPreview(null); return; }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);
  const url = preview || currentUrl;

  return <section className={styles.picker} aria-labelledby={`${id}-title`}>
    <h2 id={`${id}-title`}>{options.label}</h2>
    <div className={styles.controls}>
      {url && (kind === "audio"
        ? <audio controls preload="none" src={url} aria-label={file ? "Audio seleccionado" : "Audio actual"} style={{ width: "100%", marginBottom: 16 }} />
        : <p><a href={url} target="_blank" rel="noopener noreferrer" className="underline">{file ? "Revisar PDF seleccionado" : "Ver PDF actual"}</a></p>)}
      <input ref={input} id={id} type="file" accept={options.accept} hidden disabled={disabled} onChange={event => {
        const selected = event.target.files?.[0];
        event.target.value = "";
        if (!selected) return;
        const problem = validateArchetypeResource(selected, kind);
        setError(problem);
        if (!problem) onChange(selected);
      }} />
      <button type="button" className={styles.choose} disabled={disabled} aria-controls={id} aria-describedby={`${id}-help`} onClick={() => input.current?.click()}>
        {url ? "Cambiar" : "Elegir"} {kind === "audio" ? "audio" : "PDF"}
      </button>
      <p id={`${id}-help`} className={styles.help}>{options.formats} · Máximo {options.maxMB} MB.<br />El archivo se subirá al guardar los cambios.</p>
      {file && <div className={styles.selection}>
        <span title={file.name}>{file.name} · Sin guardar</span>
        <button type="button" disabled={disabled} onClick={() => { onChange(null); setError(null); }}>Descartar selección</button>
      </div>}
      {error && <p role="alert" className={styles.error}>{error}</p>}
    </div>
  </section>;
}
