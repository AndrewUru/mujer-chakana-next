// Removed unused Registro type to fix the error.

// types/index.ts

export interface MujerChakanaData {
  id: number;
  dia_ciclo: number;
  arquetipo: string;
  descripcion: string;
  imagen_url?: string;
  elemento: string;
  audio_url?: string;
  ritual_pdf?: string;
  tip_extra: string;
  semana?: number;
}

export interface Perfil {
  display_name: string;
  avatar_url: string | null;
  user_id: string;
}

export interface Fase {
  nombre_fase: string;
  resumen_emocional: string;
  energia?: number;
  espiritualidad?: number;
  creatividad?: number;
  ciclo_id: string;
}

export interface EstadoCiclo {
  id: string;
  dia_ciclo: number;
  arquetipo: string;
  descripcion: string;
  imagen_url: string;
  elemento: string;
}

export interface Moonboard {
  id: string;
  usuario_id: string;
  nombre: string;
  fecha_creacion: string;
  datos_visuales: string; // Podrías luego definirlo mejor si quieres
}

export interface Recurso {
  id: string;
  tipo: string;
  titulo: string;
  url: string;
  descripcion: string;
  tipo_suscripcion: "gratuito" | "mensual" | "anual";
}
