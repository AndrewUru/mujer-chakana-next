// La tienda pública permanece oculta salvo que se active expresamente. Se resuelve
// en build: cambiarla requiere un nuevo despliegue. Ver docs/SHOP.md.
export const SHOP_ENABLED = process.env.NEXT_PUBLIC_SHOP_ENABLED === "true";
