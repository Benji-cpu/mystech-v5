import { cn } from "@/lib/utils";

interface EditorialShellProps {
  children: React.ReactNode;
  className?: string;
  /** When true, the shell is not fixed/overflow-y-auto — use when rendering inside another scroll container. */
  inline?: boolean;
}

export function EditorialShell({ children, className, inline = false }: EditorialShellProps) {
  return (
    <div
      className={cn(
        "daylight",
        inline ? "min-h-full" : "fixed inset-0 overflow-y-auto",
        className
      )}
      style={{ background: "var(--paper)", zIndex: inline ? undefined : 1 }}
    >
      {children}
    </div>
  );
}

interface EditorialContainerProps {
  children: React.ReactNode;
  className?: string;
  /** Default max-w-xl. Pass a Tailwind class like "max-w-3xl" to override. */
  width?: string;
}

export function EditorialContainer({
  children,
  className,
  width = "max-w-xl",
}: EditorialContainerProps) {
  return (
    <div className={cn("mx-auto px-6 py-10 pb-28 sm:px-10 sm:py-14", width, className)}>
      {children}
    </div>
  );
}
