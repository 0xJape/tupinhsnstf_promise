import Image from "next/image";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  /** Outer box size (Tailwind size class target via className). */
  size?: number;
  priority?: boolean;
};

/** App mark from public/brand/promise_logo.png */
export function BrandLogo({ className, size = 32, priority }: Props) {
  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 overflow-hidden rounded-2xl",
        className,
      )}
      style={{ width: size, height: size }}
    >
      <Image
        src="/brand/promise_logo.png"
        alt=""
        fill
        sizes={`${size}px`}
        className="object-contain"
        priority={priority}
      />
    </span>
  );
}
