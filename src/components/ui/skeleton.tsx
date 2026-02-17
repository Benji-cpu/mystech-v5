import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("bg-white/[0.06] animate-shimmer rounded-md", className)}
      {...props}
    />
  )
}

export { Skeleton }
