import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  size?: number;
  className?: string;
}

export function Logo({ size = 32, className }: LogoProps) {
  return (
    <Image
      src="/brand/logo.svg"
      alt=""
      width={size}
      height={size}
      className={cn("inline-block", className)}
      priority
    />
  );
}
