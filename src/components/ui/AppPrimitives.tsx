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

export function GlassCard<T extends ElementType = "section">({
  as,
  className,
  children,
  ...props
}: PolymorphicProps<T>) {
  const Component = as ?? "section";

  return (
    <Component
      className={cx(
        "app-surface rounded-[22px] p-4 sm:rounded-3xl sm:p-6 lg:p-8",
        className
      )}
      {...props}
    >
      {children}
    </Component>
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
    "app-focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-blush px-5 py-2.5 text-sm font-bold text-blush-deep transition hover:-translate-y-0.5 hover:brightness-105",
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
