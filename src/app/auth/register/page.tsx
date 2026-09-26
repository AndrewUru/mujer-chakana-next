import Link from "next/link";
import RegisterForm from "@/components/RegisterForm";
import AccountGateway from "@/components/ui/AccountGateway";

export default function RegisterPage() {
  return (
    <AccountGateway eyebrow="01 / El primer paso" title="Un espacio tuyo." accent="Un nuevo comienzo." description="Empieza a observar tu ciclo y a registrar lo que sientes. Crea tu cuenta gratuita y descubre tu propio ritmo." formTitle="Tu viaje empieza aquí.">
      <RegisterForm />
      <p>Podrás añadir tu imagen de perfil después de confirmar tu correo.</p>
      <p>¿Ya tienes cuenta? <Link href="/auth/login">Inicia sesión</Link></p>
    </AccountGateway>
  );
}
