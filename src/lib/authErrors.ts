// Traduce los errores de Supabase Auth a mensajes que una usuaria pueda entender.
type AuthErrorLike = { message?: string; code?: string; status?: number } | null | undefined;

export function isEmailNotConfirmed(error: AuthErrorLike): boolean {
  return error?.code === "email_not_confirmed" || /email not confirmed/i.test(error?.message ?? "");
}

export function authErrorMessage(error: AuthErrorLike): string {
  const message = error?.message ?? "";
  const code = error?.code ?? "";

  if (code === "invalid_credentials" || /invalid login credentials/i.test(message)) {
    return "Correo o contraseña incorrectos. Inténtalo de nuevo.";
  }
  if (isEmailNotConfirmed(error)) {
    return "Tu correo todavía no está confirmado. Abre el enlace que te enviamos o pide uno nuevo.";
  }
  const wait = message.match(/after (\d+) seconds?/i)?.[1];
  if (wait) {
    return `Acabamos de enviarte un correo. Espera ${wait} segundos antes de pedir otro.`;
  }
  if (code === "over_email_send_rate_limit" || /rate limit/i.test(message) || error?.status === 429) {
    return "Hemos enviado demasiados correos en poco tiempo. Vuelve a intentarlo dentro de una hora.";
  }
  if (code === "user_already_exists" || code === "email_exists" || /already registered/i.test(message)) {
    return "Ya existe una cuenta con este correo. Inicia sesión.";
  }
  if (code === "weak_password" || /password should/i.test(message)) {
    return "Elige una contraseña más segura (más larga o con más variedad de caracteres).";
  }
  if (code === "email_address_invalid" || /email address .* is invalid/i.test(message)) {
    return "Ese correo no parece válido. Revísalo e inténtalo de nuevo.";
  }
  if (code === "signup_disabled") {
    return "El registro está cerrado en este momento.";
  }
  if (/fetch|network/i.test(message)) {
    return "No hay conexión con el servidor. Comprueba tu internet e inténtalo de nuevo.";
  }
  return "No pudimos completar la operación. Inténtalo de nuevo en unos minutos.";
}
