export interface Database {
  public: {
    Tables: {
      perfiles: {
        Row: {
          id: string;
          inicio_ciclo: string; // asegúrate del nombre
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
          inicio_ciclo: string;
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
