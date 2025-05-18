export interface Database {
  public: {
    Tables: {
      perfiles: {
        Row: {
          id: string;
          fecha_inicio: string; // formato YYYY-MM-DD
          avatar_url: string | null;
          display_name: string;
          user_id: string;
          perfil_completo: boolean;
          ciclo_actual: string;
          suscripcion_activa: boolean;
          rol: string;
          tipo_plan: string;
          email: string;
        };
        Insert: {
          id?: string;
          fecha_inicio: string;
          avatar_url?: string | null;
          display_name: string;
          user_id: string;
          perfil_completo?: boolean;
          ciclo_actual: string;
          suscripcion_activa?: boolean;
          rol?: string;
          tipo_plan?: string;
          email: string;
        };
        Update: Partial<Database["public"]["Tables"]["perfiles"]["Row"]>;
      };
    };
  };
}
