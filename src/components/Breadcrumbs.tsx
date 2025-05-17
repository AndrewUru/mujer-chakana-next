import Link from "next/link";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

export default function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
        {items.map((item, idx) => (
          <li key={idx} className="flex items-center">
            {item.href ? (
              <Link
                href={item.href}
                className="text-pink-700 hover:text-pink-900 font-medium transition"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-pink-400 font-semibold">{item.label}</span>
            )}
            {idx < items.length - 1 && (
              <span className="mx-2 text-pink-300">/</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
