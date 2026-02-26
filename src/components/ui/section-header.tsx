import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function SectionHeader({ children, className }: SectionHeaderProps) {
  return (
    <h3
      className={cn(
        "text-xs font-medium tracking-wider uppercase text-[#c9a94e]",
        className
      )}
    >
      {children}
    </h3>
  );
}
