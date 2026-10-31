import Link from "next/link";
import { type HeroProps } from "../types/ui-component";

export default function Hero({
  title,
  subtitle,
  backgroundStyle,
  primaryCtaText,
  primaryCtaLink,
  secondaryCtaText,
  secondaryCtaLink,
  align = "center",
  children,
}: HeroProps) {
  const isCentered = align === "center";

  const actualBackgroundStyle =
    backgroundStyle || "var(--hero-gradient)";

  const buttonStyles =
    "inline-block rounded-3xl px-4 py-2 h-10 font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2";

  return (
    <section
      className="hero-section"
      style={{ background: actualBackgroundStyle }}
    >
      <div
        className={`flex flex-col gap-4 p-10 ${
          isCentered
            ? "mx-auto max-w-6xl items-center text-center"
            : "max-w-4xl items-start text-left"
        }`}
      >
        <h1 className="mb-6 text-5xl font-extrabold leading-tight tracking-tight sm:text-5xl md:text-6xl">
          {title}
        </h1>

        <p className="mb-8 text-lg leading-relaxed max-sm:text-xl">
          {subtitle}
        </p>

        {children && <div className="mb-8 w-full">{children}</div>}

        <div
          className={`flex flex-wrap gap-4 ${
            isCentered ? "justify-center" : "justify-start"
          }`}
        >
          {primaryCtaText && primaryCtaLink && (
            <Link
              href={primaryCtaLink}
              className={`${buttonStyles} bg-brand text-foreground hover:bg-primary-hover`}
            >
              {primaryCtaText}
            </Link>
          )}

          {secondaryCtaText && secondaryCtaLink && (
            <Link
              href={secondaryCtaLink}
              className={`${buttonStyles} border border-(--border-default) bg-transparent text-(--text-secondary) hover:bg-primary-hover`}
            >
              {secondaryCtaText}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}

