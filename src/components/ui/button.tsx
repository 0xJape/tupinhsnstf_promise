import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-[20px] border border-transparent bg-clip-padding text-sm font-bold tracking-wide whitespace-nowrap transition-[color,background-color,border-color,box-shadow,transform,opacity,filter] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] outline-none select-none focus-visible:ring-3 focus-visible:ring-ring/40 active:not-aria-[haspopup]:scale-[0.94] disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-[12px_12px_24px_rgba(159,41,71,0.3),-8px_-8px_16px_rgba(255,255,255,0.4),inset_4px_4px_8px_rgba(255,255,255,0.4),inset_-4px_-4px_8px_rgba(0,0,0,0.1)] hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-[14px_16px_28px_rgba(159,41,71,0.38),-8px_-8px_18px_rgba(255,255,255,0.5)] dark:shadow-[8px_8px_18px_rgba(0,0,0,0.3)]",
        outline:
          "bg-secondary text-secondary-foreground shadow-[12px_12px_24px_rgba(160,150,180,0.22),-8px_-8px_16px_rgba(255,255,255,0.9),inset_4px_4px_8px_rgba(255,255,255,0.6)] hover:-translate-y-0.5 aria-expanded:bg-secondary dark:shadow-[8px_8px_18px_rgba(0,0,0,0.28)]",
        secondary:
          "bg-secondary text-secondary-foreground shadow-[12px_12px_24px_rgba(160,150,180,0.22),-8px_-8px_16px_rgba(255,255,255,0.9),inset_4px_4px_8px_rgba(255,255,255,0.6)] hover:-translate-y-0.5 aria-expanded:bg-secondary dark:shadow-[8px_8px_18px_rgba(0,0,0,0.28)]",
        ghost:
          "text-muted-foreground hover:bg-accent hover:text-accent-foreground aria-expanded:bg-accent",
        destructive:
          "bg-gradient-to-br from-rose-400 to-rose-600 text-white shadow-[10px_10px_20px_rgba(225,29,72,0.28)] hover:-translate-y-0.5",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default:
          "h-11 min-h-11 gap-1.5 px-4 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
        xs: "h-8 gap-1 rounded-[16px] px-2.5 text-xs has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-9 gap-1 rounded-[18px] px-3 text-[0.8rem] has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-12 min-h-12 gap-2 px-5 text-base has-data-[icon=inline-end]:pr-4 has-data-[icon=inline-start]:pl-4",
        icon: "size-11",
        "icon-xs":
          "size-8 rounded-[16px] [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":
          "size-9 rounded-[18px]",
        "icon-lg": "size-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
