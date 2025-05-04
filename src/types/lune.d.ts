declare module "lune" {
  export function phase_hunt(date: Date): {
    new_date: Date;
    first_quarter: Date;
    full_date: Date;
    last_quarter: Date;
  };

  export function phase(fechaActual: Date): { phase: any } {
    throw new Error("Function not implemented.");
  }
}
