"use client";

import { useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, Upload, X } from "lucide-react";
import { validateArchetypeImage } from "@/lib/archetypeImages";
import styles from "./ArchetypeImagePicker.module.css";

type Props = {
  currentUrl?: string | null;
  name: string;
  file: File | null;
  onChange: (file: File | null) => void;
  disabled?: boolean;
};

export default function ArchetypeImagePicker({ currentUrl, name, file, onChange, disabled }: Props) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!file) { setPreview(null); return; }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const image = preview || currentUrl;
  return (
    <section className={styles.picker} aria-labelledby={`${id}-title`}>
      <h2 id={`${id}-title`}>Imagen del arquetipo</h2>
      <div className={styles.layout}>
        <div className={styles.preview}>
          {image ? <Image src={image} alt={`Imagen ${file ? "seleccionada" : "actual"} de ${name}`} fill sizes="(max-width: 540px) 80vw, 180px" unoptimized className={styles.image} /> : <span className={styles.placeholder}><ImagePlus size={32} aria-hidden="true" />Sin imagen</span>}
          {file && <span className={styles.badge}>Sin guardar</span>}
        </div>
        <div className={styles.controls}>
          <p>Elige la imagen que acompañará a este arquetipo en el atlas y en tu ciclo.</p>
          <input
            ref={inputRef}
            id={id}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            disabled={disabled}
            hidden
            onChange={event => {
              const selected = event.target.files?.[0];
              event.target.value = "";
              if (!selected) return;
              const problem = validateArchetypeImage(selected);
              setError(problem);
              if (!problem) onChange(selected);
            }}
          />
          <button type="button" className={styles.choose} disabled={disabled} onClick={() => inputRef.current?.click()} aria-controls={id} aria-describedby={`${id}-help${error ? ` ${id}-error` : ""}`}>
            <Upload size={18} aria-hidden="true" />{image ? "Cambiar imagen" : "Elegir imagen"}
          </button>
          <p id={`${id}-help`} className={styles.help}>JPG, PNG o WebP · Máximo 5 MB.<br />La imagen se subirá al guardar los cambios.</p>
          {file && <div className={styles.selection}>
            <span title={file.name}>{file.name}</span>
            <button type="button" disabled={disabled} onClick={() => { onChange(null); setError(null); }}><X size={16} aria-hidden="true" />Descartar selección</button>
          </div>}
          {error && <p id={`${id}-error`} role="alert" className={styles.error}>{error}</p>}
        </div>
      </div>
    </section>
  );
}
