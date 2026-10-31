import React from "react";

import Link from "next/link";
import { type ButtonVariant } from "@/app/types/ui-component";

type LinkButtonProps = {
  to?: string;
  variant?: "filled" | "outline" | "ghost";
  href?: string;
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLElement>;

export default function LinkButton({
  to,
  href,
  variant = "outline",
  className = "",
  children,
  ...delegated
}: LinkButtonProps) {
  // 3. Base styles shared by ALL buttons
  const baseStyles =
    "inline-block px-4 py-2 rounded-3xl font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none h-10 truncate";

  // 4. Variant-specific styles
  const variantStyles: Record<ButtonVariant, string> = {
    filled: "bg-brand text-foreground hover:bg-brand-hover",
    outline:
      "border border-(--border-default) text-(--text-secondary) bg-transparent hover:bg-canvas active:bg-subtle",
    ghost:
      "text-gray-700 bg-transparent hover:bg-subtle active:bg-muted",
  };

  // 5. Combine everything dynamically
  const combinedClasses =
    `${baseStyles} ${variantStyles[variant]} ${className}`.trim();
  // Internal navigation
  if (to) {
    return (
      <Link href={to} className={combinedClasses} {...delegated}>
        {children}
      </Link>
    );
  }

  // External navigation
  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        className={combinedClasses}
        {...delegated}
      >
        {children}
      </a>
    );
  }

  // Regular button
  return (
    <button className={baseStyles} {...delegated}>
      {children}
    </button>
  );
}
