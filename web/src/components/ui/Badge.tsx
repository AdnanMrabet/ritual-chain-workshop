import { cn } from "@/lib/utils";

export function Badge({
  children,
  color = "var(--color-lime)",
  dot = false,
  className,
}: {
  children: React.ReactNode;
  color?: string;
  dot?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[13px] font-medium",
        className
      )}
      style={{
        color,
        borderColor: `color-mix(in srgb, ${color} 35%, transparent)`,
        background: `color-mix(in srgb, ${color} 10%, transparent)`,
      }}
    >
      {dot && (
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ background: color, boxShadow: `0 0 8px 1px ${color}` }}
        />
      )}
      {children}
    </span>
  );
}
