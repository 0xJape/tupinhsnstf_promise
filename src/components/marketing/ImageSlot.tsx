import Image from "next/image";
import { ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  /** Path under /public, e.g. /brand/hero-pcos.jpg */
  src?: string;
  alt: string;
  caption?: string;
  /** Hint shown when no image yet */
  placeholderHint: string;
  className?: string;
  priority?: boolean;
  aspect?: "hero" | "card";
};

/**
 * Education image slot. Drop real files in public/brand/ then pass src.
 * Without src (or until you add the file), shows a soft placeholder.
 */
export function ImageSlot({
  src,
  alt,
  caption,
  placeholderHint,
  className,
  priority,
  aspect = "card",
}: Props) {
  const ratio = aspect === "hero" ? "aspect-[16/10]" : "aspect-[4/3]";

  return (
    <figure className={cn("space-y-2", className)}>
      <div
        className={cn(
          "surface-panel relative overflow-hidden rounded-2xl",
          ratio,
        )}
      >
        {src ? (
          <Image
            src={src}
            alt={alt}
            fill
            priority={priority}
            className="object-cover"
            sizes="(max-width: 512px) 100vw, 512px"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-6 text-center">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <ImageIcon className="size-6" aria-hidden />
            </span>
            <p className="text-sm font-medium text-foreground/80">
              Photo placeholder
            </p>
            <p className="max-w-[16rem] text-xs leading-relaxed text-muted-foreground">
              {placeholderHint}
            </p>
          </div>
        )}
      </div>
      {caption ? (
        <figcaption className="px-1 text-xs leading-relaxed text-muted-foreground">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
