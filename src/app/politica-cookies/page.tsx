import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import BrandLogo from "@/components/ui/BrandLogo";
import ConsentButton from "./ConsentButton";
import styles from "./politica.module.css";

const SECTIONS = [
  { id: "que-son", title: "¿Qué son las cookies?" },
  { id: "tipos", title: "¿Qué tipos de cookies usamos?" },
  { id: "consentimiento", title: "Consentimiento" },
  { id: "control", title: "Control de cookies" },
  { id: "contacto", title: "Contacto" },
];

function SectionTitle({ index }: { index: number }) {
  const { id, title } = SECTIONS[index];
  return (
    <h2 id={`${id}-title`}>
      <span>{String(index + 1).padStart(2, "0")}</span>
      {title}
    </h2>
  );
}

export default function PoliticaCookies() {
  return (
    <main className={styles.page}>
      <header className={styles.topbar}>
        <Link href="/" className={styles.back}>
          <ArrowLeft size={15} aria-hidden="true" />
          Volver al inicio
        </Link>
        <BrandLogo className={styles.brand} />
      </header>

      <div className={styles.hero}>
        <p className={styles.eyebrow}>Tu privacidad</p>
        <h1>
          Política de <em>cookies.</em>
        </h1>
        <p className={styles.lead}>
          En <strong>Ginergética</strong>, utilizamos cookies para ofrecerte una
          mejor experiencia de navegación, personalizar contenido y comprender
          cómo interactúas con nuestra plataforma.
        </p>
      </div>

      <div className={styles.layout}>
        <nav className={styles.index} aria-label="En esta página">
          <p>En esta página</p>
          <ol>
            {SECTIONS.map(({ id, title }, index) => (
              <li key={id}>
                <a href={`#${id}`}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  {title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <article className={styles.article}>
          <section id="que-son" aria-labelledby="que-son-title">
            <SectionTitle index={0} />
            <p>
              Las cookies son pequeños archivos de texto que los sitios web guardan en
              tu dispositivo cuando los visitas. Ayudan a que la página recuerde tus
              preferencias y mejoran la funcionalidad y el rendimiento del sitio.
            </p>
          </section>

          <section id="tipos" aria-labelledby="tipos-title">
            <SectionTitle index={1} />
            <dl className={styles.types}>
              <div>
                <dt>Cookies esenciales</dt>
                <dd>Necesarias para que el sitio funcione correctamente.</dd>
              </div>
              <div>
                <dt>Cookies de preferencias</dt>
                <dd>
                  Permiten recordar tus elecciones (como idioma o arquetipo preferido).
                </dd>
              </div>
              <div>
                <dt>Cookies analíticas</dt>
                <dd>
                  Nos ayudan a entender cómo usas la plataforma para mejorarla
                  continuamente.
                </dd>
              </div>
            </dl>
          </section>

          <section id="consentimiento" aria-labelledby="consentimiento-title">
            <SectionTitle index={2} />
            <p>
              Al aceptar el uso de cookies en nuestra notificación emergente, estás
              consintiendo que coloquemos cookies en tu dispositivo. Puedes retirar tu
              consentimiento en cualquier momento eliminando las cookies desde la
              configuración de tu navegador.
            </p>
            <ConsentButton className={styles.action} />
          </section>

          <section id="control" aria-labelledby="control-title">
            <SectionTitle index={3} />
            <p>
              Puedes configurar tu navegador para aceptar o rechazar cookies, o para
              que te notifique cuando se envíen cookies. Ten en cuenta que bloquear
              algunas cookies puede afectar la funcionalidad de la plataforma.
            </p>
          </section>

          <section id="contacto" aria-labelledby="contacto-title">
            <SectionTitle index={4} />
            <p>
              Para cualquier duda sobre nuestra política de cookies, puedes
              escribirnos a{" "}
              <a href="mailto:samariluz@uantak.com">samariluz@uantak.com</a>.
            </p>
          </section>
        </article>
      </div>
    </main>
  );
}
