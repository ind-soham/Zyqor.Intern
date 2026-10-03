import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const Button = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'outline' | 'ghost' }>(
  ({ className, variant = 'primary', ...props }, ref) => {
    const base = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none disabled:opacity-50 disabled:pointer-events-none text-sm px-5 py-2.5";
    const variants = {
      primary: "bg-accent text-white hover:bg-accentHover shadow-sm",
      secondary: "bg-surface text-foreground border border-border hover:bg-zinc-50 shadow-subtle",
      outline: "border border-border text-foreground hover:bg-zinc-50",
      ghost: "hover:bg-zinc-100 text-foreground",
    };
    return <button ref={ref} className={cn(base, variants[variant], className)} {...props} />;
  }
);
Button.displayName = "Button";

export const Badge = ({ children, className, variant = 'default' }: { children: React.ReactNode, className?: string, variant?: 'default' | 'accent' | 'success' }) => {
  const variants = {
    default: "bg-zinc-100 text-zinc-600 border border-zinc-200",
    accent: "bg-blue-50 text-accent border border-blue-100",
    success: "bg-green-50 text-success border border-green-100",
  };
  return (
    <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-medium", variants[variant], className)}>
      {children}
    </span>
  );
};