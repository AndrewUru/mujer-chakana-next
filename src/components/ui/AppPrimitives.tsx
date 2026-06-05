import Link from "next/link";
import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";

type PolymorphicProps<T extends ElementType> = {
  as?: T;
  className?: string;
  children: ReactNode;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "className" | "children">;

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function PageShell({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cx("app-page px-4 py-8 sm:px-6 sm:py-10", className)}>
      <div className="app-container">{children}</div>
    </div>
  );
}

export function GlassCard<T extends ElementType = "section">({
  as,
  className,
  children,
  ...props
}: PolymorphicProps<T>) {
  const Component = as ?? "section";

  return (
    <Component
      className={cx("glass-panel rounded-3xl p-6 sm:p-8", className)}
      {...props}
    >
      {children}
    </Component>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  action,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <header
      className={cx(
        "flex flex-col gap-4 text-rose-950 sm:flex-row sm:items-end sm:justify-between",
        className
      )}
    >
      <div className="max-w-2xl space-y-2">
        {eyebrow ? <p className="app-kicker">{eyebrow}</p> : null}
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          {title}
        </h1>
        {description ? (
          <p className="text-sm leading-6 text-rose-800/72 sm:text-base">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </header>
  );
}

export function PrimaryAction({
  href,
  className,
  children,
  ...props
}: {
  href?: string;
  className?: string;
  children: ReactNode;
} & ComponentPropsWithoutRef<"button"> &
  Partial<ComponentPropsWithoutRef<typeof Link>>) {
  const baseClassName = cx(
    "app-focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-white/60 bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(190,18,60,0.22)] transition hover:-translate-y-0.5 hover:bg-rose-700",
    className
  );

  if (href) {
    return (
      <Link href={href} className={baseClassName}>
        {children}
      </Link>
    );
  }

  return (
    <button className={baseClassName} {...props}>
      {children}
    </button>
  );
}
