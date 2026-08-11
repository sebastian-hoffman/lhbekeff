import Image from "next/image";
import { cn } from "@/lib/utils";

type LogoProps = {
  /** "full" = isotipo + wordmark "Bekeff 2026" (para hero/landing). "mark" = solo el isotipo (para navbars compactas). */
  variant?: "full" | "mark";
  className?: string;
  priority?: boolean;
};

export function Logo({ variant = "full", className, priority }: LogoProps) {
  if (variant === "mark") {
    return (
      <Image
        src="/icon-mark.png"
        alt="Bekeff"
        width={40}
        height={40}
        priority={priority}
        className={cn("rounded-full", className)}
      />
    );
  }

  return (
    <Image
      src="/logo-bekeff.png"
      alt="Bekeff 2026"
      width={562}
      height={274}
      priority={priority}
      className={cn("h-auto w-full", className)}
    />
  );
}
