import { ShieldCheck } from "lucide-react";

export default function PoliticaCookies() {
  return (
    <main className="h-full p-8 bg-white/85 rounded-2xl shadow max-w-3xl mx-auto text-gray-800 space-y-4">
      <div className="flex items-center space-x-2 mb-4">
        <ShieldCheck className="w-7 h-7 text-rose-700" />
        <h1 className="text-3xl font-bold text-rose-700">
          Política de Cookies
        </h1>
      </div>

      <p>
        En <strong>Ginergética</strong>, utilizamos cookies para ofrecerte una
        mejor experiencia de navegación, personalizar contenido y comprender
        cómo interactúas con nuestra plataforma.
      </p>

      <h2 className="text-xl font-semibold text-rose-600 mt-6">
        ¿Qué son las cookies?
      </h2>
      <p>
        Las cookies son pequeños archivos de texto que los sitios web guardan en
        tu dispositivo cuando los visitas. Ayudan a que la página recuerde tus
        preferencias y mejoran la funcionalidad y el rendimiento del sitio.
      </p>

      <h2 className="text-xl font-semibold text-rose-600 mt-6">
        ¿Qué tipos de cookies usamos?
      </h2>
      <ul className="list-disc list-inside space-y-2 pl-2">
        <li>
          <strong>Cookies esenciales:</strong> Necesarias para que el sitio
          funcione correctamente.
        </li>
        <li>
          <strong>Cookies de preferencias:</strong> Permiten recordar tus
          elecciones (como idioma o arquetipo preferido).
        </li>
        <li>
          <strong>Cookies analíticas:</strong> Nos ayudan a entender cómo usas
          la plataforma para mejorarla continuamente.
        </li>
      </ul>

      <h2 className="text-xl font-semibold text-rose-600 mt-6">
        Consentimiento
      </h2>
      <p>
        Al aceptar el uso de cookies en nuestra notificación emergente, estás
        consintiendo que coloquemos cookies en tu dispositivo. Puedes retirar tu
        consentimiento en cualquier momento eliminando las cookies desde la
        configuración de tu navegador.
      </p>

      <h2 className="text-xl font-semibold text-rose-600 mt-6">
        Control de cookies
      </h2>
      <p>
        Puedes configurar tu navegador para aceptar o rechazar cookies, o para
        que te notifique cuando se envíen cookies. Ten en cuenta que bloquear
        algunas cookies puede afectar la funcionalidad de la plataforma.
      </p>

      <h2 className="text-xl font-semibold text-rose-600 mt-6">Contacto</h2>
      <p>
        Para cualquier duda sobre nuestra política de cookies, puedes
        escribirnos a{" "}
        <a
          href="mailto:samariluz@uantak.com"
          className="underline text-rose-700"
        >
          samariluz@uantak.com
        </a>
        .
      </p>
    </main>
  );
}
