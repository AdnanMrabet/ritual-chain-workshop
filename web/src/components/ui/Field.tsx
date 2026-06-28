import { forwardRef } from "react";
import { cn } from "@/lib/utils";

/* Inputs / textareas styled as part of a greenhouse control surface.
   They gently expand and light up on focus. */

export const Input = forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "w-full rounded-xl border border-[var(--color-mist)]/12 bg-black/25 px-4 py-3 text-[16px] text-[var(--color-mist)] placeholder:text-[var(--color-mist)]/35 outline-none transition-all duration-300 focus:border-[var(--color-lime)]/55 focus:bg-black/35 focus:shadow-[0_0_22px_-8px_var(--color-lime)]",
      className
    )}
    {...props}
  />
));
Input.displayName = "Input";

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "w-full resize-y rounded-xl border border-[var(--color-mist)]/12 bg-black/25 px-4 py-3 text-[16px] leading-relaxed text-[var(--color-mist)] placeholder:text-[var(--color-mist)]/35 outline-none transition-all duration-300 focus:border-[var(--color-lime)]/55 focus:bg-black/35 focus:shadow-[0_0_22px_-8px_var(--color-lime)]",
      className
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";

export function FieldLabel({
  children,
  hint,
  accent = "var(--color-lime)",
}: {
  children: React.ReactNode;
  hint?: string;
  accent?: string;
}) {
  return (
    <div className="mb-2 flex items-baseline justify-between gap-3">
      <label
        className="text-[14px] font-medium tracking-wide"
        style={{ color: accent }}
      >
        {children}
      </label>
      {hint && (
        <span className="text-[13px] text-[var(--color-mist)]/45">{hint}</span>
      )}
    </div>
  );
}
