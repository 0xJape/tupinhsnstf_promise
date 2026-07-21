import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-24 w-full rounded-[20px] border-0 bg-input px-4 py-3 text-base font-medium text-foreground shadow-[inset_8px_8px_16px_rgba(217,212,227,0.55),inset_-6px_-6px_14px_rgba(255,255,255,0.95)] transition-[box-shadow,background-color] outline-none placeholder:text-muted-foreground focus-visible:bg-input focus-visible:ring-3 focus-visible:ring-ring/25 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:ring-3 aria-invalid:ring-destructive/25 dark:shadow-[inset_4px_4px_10px_rgba(0,0,0,0.2)] md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
