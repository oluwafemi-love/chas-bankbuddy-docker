import type { ReactNode, ComponentPropsWithoutRef } from "react";

// Hero Component
// type HeroIcon = React.ComponentType<React.SVGProps<SVGSVGElement>>;

export interface HeroProps {
  title: string;
  secondTitle?: string;
  subtitle: string;
  backgroundStyle?: string;
  primaryCtaText: string;
  primaryCtaLink: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
  align: "center" | "left";
  children?: ReactNode;
}


//Button Component
export type ButtonVariant = 'filled' | 'outline' | 'ghost';

export interface ButtonProps extends ComponentPropsWithoutRef<'button'> {
  title?: string;
  variant?: ButtonVariant; // Optional: defaults to 'filled'
}

