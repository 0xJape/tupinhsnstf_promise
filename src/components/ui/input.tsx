import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-12 w-full min-w-0 rounded-[20px] border-0 bg-input px-4 py-2 text-base font-medium text-foreground shadow-[inset_8px_8px_16px_rgba(217,212,227,0.55),inset_-6px_-6px_14px_rgba(255,255,255,0.95)] transition-[box-shadow,background-color] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:bg-input focus-visible:ring-3 focus-visible:ring-ring/25 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:ring-3 aria-invalid:ring-destructive/25 dark:shadow-[inset_4px_4px_10px_rgba(0,0,0,0.2)] md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Input }
