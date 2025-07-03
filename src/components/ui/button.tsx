import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-300 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "gradient-button text-primary-foreground shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] backdrop-blur-sm",
        destructive:
          "bg-gradient-to-r from-destructive-solid to-red-600 text-white shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40",
        outline:
          "border-2 border-border/60 bg-card/50 backdrop-blur-sm shadow-md hover:bg-accent/60 hover:text-accent-foreground hover:border-border hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] dark:bg-input/20 dark:border-input/60 dark:hover:bg-input/40",
        secondary:
          "bg-secondary/80 backdrop-blur-sm text-secondary-foreground shadow-md hover:bg-secondary hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]",
        ghost:
          "hover:bg-accent/60 hover:text-accent-foreground hover:shadow-md transition-all duration-300 dark:hover:bg-accent/40",
        link: "text-primary underline-offset-4 hover:underline hover:text-primary/80",
      },
      size: {
        default: "h-11 px-6 py-3 has-[>svg]:px-4",
        sm: "h-9 rounded-lg gap-1.5 px-4 has-[>svg]:px-3 text-xs font-medium",
        lg: "h-12 rounded-xl px-8 has-[>svg]:px-6 text-base",
        icon: "size-11",
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
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
