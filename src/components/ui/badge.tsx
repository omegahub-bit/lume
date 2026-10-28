import { cn } from "@/lib/utils";

export function Badge({
  className,
  tone = "muted",
  children,
}: {
  className?: string;
  tone?: "muted" | "accent" | "success" | "danger" | "pending";
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[0.6875rem] font-medium uppercase tracking-[0.14em]",
        tone === "muted" && "bg-elevated text-muted",
        tone === "accent" && "bg-accent text-accent-fg",
        tone === "success" && "bg-success/20 text-success",
        tone === "danger" && "bg-danger/20 text-danger",
        tone === "pending" && "bg-fg/10 text-fg",
        className,
      )}
    >
      {children}
    </span>
  );
}
