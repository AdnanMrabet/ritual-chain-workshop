import { forwardRef } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/* Heavily customised button — organic glass that fills with light on hover.
   Nothing about it looks like default shadcn. */
const buttonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-2xl font-medium tracking-wide transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-45 active:scale-[0.98]",
  {
    variants: {
      variant: {
        // living / participant primary
        lime: "bg-[var(--color-lime)]/12 text-[var(--color-lime)] border border-[var(--color-lime)]/35 hover:bg-[var(--color-lime)]/22 hover:shadow-[0_0_28px_-6px_var(--color-lime)] focus-visible:ring-[var(--color-lime)]/50",
        // owner actions
        clay: "bg-[var(--color-clay)]/14 text-[var(--color-clay)] border border-[var(--color-clay)]/40 hover:bg-[var(--color-clay)]/24 hover:shadow-[0_0_28px_-6px_var(--color-clay)] focus-visible:ring-[var(--color-clay)]/50",
        // reward / finalize
        nectar: "bg-[var(--color-nectar)]/14 text-[var(--color-nectar)] border border-[var(--color-nectar)]/45 hover:bg-[var(--color-nectar)]/24 hover:shadow-[0_0_32px_-4px_var(--color-nectar)] focus-visible:ring-[var(--color-nectar)]/55",
        // AI
        orchid: "bg-[var(--color-orchid)]/14 text-[var(--color-orchid)] border border-[var(--color-orchid)]/40 hover:bg-[var(--color-orchid)]/24 hover:shadow-[0_0_30px_-5px_var(--color-orchid)] focus-visible:ring-[var(--color-orchid)]/50",
        ghost:
          "bg-white/[0.03] text-[var(--color-mist)]/80 border border-[var(--color-mist)]/12 hover:bg-white/[0.07] hover:text-[var(--color-mist)] focus-visible:ring-[var(--color-mist)]/30",
        danger:
          "bg-[var(--color-thorn)]/12 text-[var(--color-thorn)] border border-[var(--color-thorn)]/40 hover:bg-[var(--color-thorn)]/22 focus-visible:ring-[var(--color-thorn)]/50",
      },
      size: {
        sm: "h-9 px-4 text-[14px]",
        md: "h-11 px-5 text-[15px]",
        lg: "h-14 px-7 text-[16px]",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: { variant: "lime", size: "md" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
