import HomeContent from "./home-content";
import { publicMetadata, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/seo";

export const metadata = publicMetadata("Ciclo lunar y autoconocimiento femenino", SITE_DESCRIPTION, "/");

export default function HomePage() {
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: `${SITE_URL}/`,
      name: SITE_NAME,
      description: SITE_DESCRIPTION,
      inLanguage: "es",
    }).replace(/</g, "\\u003c") }} />
    <HomeContent />
  </>;
}
