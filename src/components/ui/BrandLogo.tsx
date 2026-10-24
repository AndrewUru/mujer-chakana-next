import Link from "next/link";
import styles from "./BrandLogo.module.css";

const DOTS = [[32, 8], [49, 15], [56, 32], [49, 49], [32, 56], [15, 49], [8, 32], [15, 15]];

// Versión vectorial de logo.png (misma que favicon.svg); el trazo hereda el color del texto.
function LogoMark() {
  return (
    <svg className={styles.mark} viewBox="4 4 56 56" aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="3">
        <circle cx="32" cy="32" r="24" />
        <path d="M32 8v48M8 32h48M15 15l34 34M15 49l34-34" />
      </g>
      <g fill="currentColor">
        {DOTS.map(([cx, cy]) => <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="3" />)}
      </g>
      <path d="M32 32H17a15 15 0 0 1 15-15Z" fill="#46535a" />
      <path d="M32 32V17a15 15 0 0 1 15 15Z" fill="#ffc52f" />
      <path d="M32 32h15a15 15 0 0 1-15 15Z" fill="#ffe9ad" />
      <path d="M32 32v15a15 15 0 0 1-15-15Z" fill="#e53955" />
      <circle cx="32" cy="32" r="15" fill="none" stroke="currentColor" strokeWidth="3" />
      <path d="M32 17v30M17 32h30" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

interface BrandLogoProps {
  href?: string;
  className?: string;
  "aria-label"?: string;
}

// Logo único para todas las barras superiores: cada página solo decide posición y contenedor.
export default function BrandLogo({ href, className, "aria-label": ariaLabel }: BrandLogoProps) {
  const classes = className ? `${styles.logo} ${className}` : styles.logo;
  const content = <><LogoMark /><span className={styles.name}>Ginergética</span></>;

  return href
    ? <Link href={href} className={classes} aria-label={ariaLabel}>{content}</Link>
    : <span className={classes}>{content}</span>;
}
