export const calcularDiaCiclo = (startDate: string): number => {
  const hoy = new Date();
  const inicio = new Date(startDate);
  const diferenciaDias = Math.floor(
    (hoy.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diferenciaDias < 0) return 1; // Previene errores si la fecha está mal
  if (diferenciaDias === 0) return 1;

  return (diferenciaDias % 28) + 1;
};
